import { describe, expect, it, vi } from "vitest";
import type { $Fetch } from "ofetch";
import { FetchError } from "ofetch";
import { IonscaleClient } from "../src/client";
import { ConnectError } from "../src/errors";

function createFetcher(impl: (...args: unknown[]) => unknown): $Fetch {
  const fn = vi.fn(impl);
  return fn as unknown as $Fetch;
}

describe("IonscaleClient", () => {
  it("calls the Connect RPC endpoint with the expected URL, method and headers", async () => {
    const fetcher = createFetcher(async () => ({ version: "1.2.3", revision: "abcdef" }));

    const client = new IonscaleClient({
      baseUrl: "https://ionscale.example.com",
      token: "my-secret-token",
      fetcher,
    });

    const response = await client.getVersion();

    expect(response).toEqual({ version: "1.2.3", revision: "abcdef" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, options] = (fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(url).toBe("https://ionscale.example.com/ionscale.v1.IonscaleService/GetVersion");
    expect(options.method).toBe("POST");
    expect(options.body).toEqual({});
    const headers = options.headers as Record<string, string>;
    expect(headers["content-type"]).toBe("application/json");
    expect(headers["connect-protocol-version"]).toBe("1");
    expect(headers.authorization).toBe(["Bearer", "my-secret-token"].join(" "));
  });

  it("strips trailing slashes from the base URL", async () => {
    const fetcher = createFetcher(async () => ({ version: "1.0.0", revision: "x" }));
    const client = new IonscaleClient({ baseUrl: "https://ionscale.example.com/", fetcher });

    await client.getVersion();

    const [url] = (fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
    expect(url).toBe("https://ionscale.example.com/ionscale.v1.IonscaleService/GetVersion");
  });

  it("does not send an authorization header when no token is configured", async () => {
    const fetcher = createFetcher(async () => ({ version: "1.0.0", revision: "x" }));
    const client = new IonscaleClient({ baseUrl: "https://ionscale.example.com", fetcher });

    await client.getVersion();

    const [, options] = (fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    const headers = options.headers as Record<string, string>;
    expect(headers.authorization).toBeUndefined();
  });

  it("signs a fresh system admin token per call and prefers it over `token`", async () => {
    const fetcher = createFetcher(async () => ({ version: "1.0.0", revision: "x" }));
    const systemAdminKey = "1".repeat(63) + "2";
    const client = new IonscaleClient({
      baseUrl: "https://ionscale.example.com",
      token: "should-be-ignored",
      systemAdminKey,
      fetcher,
    });

    await client.getVersion();
    await client.getVersion();

    const calls = (fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls as [string, Record<string, unknown>][];
    const authHeaders = calls.map(([, options]) => (options.headers as Record<string, string>).authorization);

    const bearerPrefix = ["Bearer", "st_"].join(" ");
    for (const header of authHeaders) {
      expect(header?.startsWith(bearerPrefix)).toBe(true);
    }
    // Every call generates a fresh, short-lived token.
    expect(authHeaders[0]).not.toEqual(authHeaders[1]);
  });

  it("resolves a token provider function on every call", async () => {
    const fetcher = createFetcher(async () => ({ version: "1.0.0", revision: "x" }));
    const tokenProvider = vi.fn(async () => "async-token");
    const client = new IonscaleClient({ baseUrl: "https://ionscale.example.com", token: tokenProvider, fetcher });

    await client.getVersion();

    expect(tokenProvider).toHaveBeenCalledTimes(1);
    const [, options] = (fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    const headers = options.headers as Record<string, string>;
    expect(headers.authorization).toBe(["Bearer", "async-token"].join(" "));
  });

  it("normalizes numeric ids to strings in requests and responses", async () => {
    const fetcher = createFetcher(async () => ({
      tailnet: {
        id: "42",
        name: "default",
        iamPolicy: "",
        aclPolicy: "",
        serviceCollectionEnabled: false,
        fileSharingEnabled: false,
        sshEnabled: false,
        machineAuthorizationEnabled: false,
      },
    }));
    const client = new IonscaleClient({ baseUrl: "https://ionscale.example.com", fetcher });

    const response = await client.tailnets.get({ id: 42 });

    expect(response?.id).toBe("42");
    const [, options] = (fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(options.body).toEqual({ id: "42" });
  });

  it("unwraps single-key wrapped responses to return the entity directly", async () => {
    const tailnet = {
      id: "1",
      name: "default",
      iamPolicy: "",
      aclPolicy: "",
      serviceCollectionEnabled: false,
      fileSharingEnabled: false,
      sshEnabled: false,
      machineAuthorizationEnabled: false,
    };
    const fetcher = createFetcher(async () => ({ tailnet: [tailnet] }));
    const client = new IonscaleClient({ baseUrl: "https://ionscale.example.com", fetcher });

    const tailnets = await client.tailnets.list();

    expect(tailnets).toEqual([tailnet]);
  });

  it("unwraps listMachines to return the machine array directly", async () => {
    const machine = {
      id: "1",
      name: "my-machine",
      ipv4: "100.64.0.1",
      ipv6: "fd7a::1",
      clientVersion: "1.0.0",
      os: "linux",
    };
    const fetcher = createFetcher(async () => ({ machines: [machine] }));
    const client = new IonscaleClient({ baseUrl: "https://ionscale.example.com", fetcher });

    const machines = await client.machines.list({ tailnetId: 1 });

    expect(machines).toEqual([expect.objectContaining(machine)]);
  });

  it("unwraps getACLPolicy / getIAMPolicy to return the policy string directly", async () => {
    const fetcher = createFetcher(async () => ({ policy: "some-policy" }));
    const client = new IonscaleClient({ baseUrl: "https://ionscale.example.com", fetcher });

    await expect(client.acl.get({ tailnetId: 1 })).resolves.toBe("some-policy");
    await expect(client.iam.get({ tailnetId: 1 })).resolves.toBe("some-policy");
  });

  it("unwraps getDefaultDERPMap / getDERPMap / setDERPMap to return the value string directly", async () => {
    const fetcher = createFetcher(async () => ({ value: "base64-value" }));
    const client = new IonscaleClient({ baseUrl: "https://ionscale.example.com", fetcher });

    await expect(client.derp.getDefault()).resolves.toBe("base64-value");
    await expect(client.derp.get({ tailnetId: 1 })).resolves.toBe("base64-value");
    await expect(client.derp.set({ tailnetId: 1, value: "base64-value" })).resolves.toBe("base64-value");
  });

  it("throws a ConnectError with the server-provided code and message on failure", async () => {
    const fetcher = createFetcher(async () => {
      throw new FetchError("Not Found", { cause: undefined });
    });
    const err = await createFailingCall(fetcher, { code: "not_found", message: "tailnet not found" }, 404);

    expect(err).toBeInstanceOf(ConnectError);
    expect(err.code).toBe("not_found");
    expect(err.message).toBe("tailnet not found");
    expect(err.httpStatus).toBe(404);
  });

  it("throws a ConnectError when the response fails schema validation", async () => {
    const fetcher = createFetcher(async () => ({ notVersion: true }));
    const client = new IonscaleClient({ baseUrl: "https://ionscale.example.com", fetcher });

    await expect(client.getVersion()).rejects.toThrow(ConnectError);
  });

  it("streams Authenticate responses, framed per the Connect streaming protocol", async () => {
    const messages = [
      { authUrl: "https://ionscale.example.com/a/abc", token: "" },
      { authUrl: "", token: "final-token", tailnetId: "7" },
    ];
    const body = encodeConnectStream(messages);
    const fetcher = createFetcher(() => {
      throw new Error("unary fetch should not be called for streaming RPCs");
    });
    (fetcher as unknown as { raw: ReturnType<typeof vi.fn> }).raw = vi.fn(async () => ({
      body,
    }));

    const client = new IonscaleClient({ baseUrl: "https://ionscale.example.com", fetcher });

    const received = [];
    for await (const message of client.auth.authenticate()) {
      received.push(message);
    }

    expect(received).toEqual([
      { authUrl: "https://ionscale.example.com/a/abc", token: "" },
      { authUrl: "", token: "final-token", tailnetId: "7" },
    ]);
  });
});

async function createFailingCall(
  fetcher: $Fetch,
  errorBody: { code: string; message: string },
  status: number
): Promise<ConnectError> {
  const failingFetcher = vi.fn(async () => {
    const error = new FetchError(errorBody.message);
    (error as { data?: unknown }).data = errorBody;
    (error as { status?: number }).status = status;
    throw error;
  }) as unknown as $Fetch;
  void fetcher;

  const client = new IonscaleClient({ baseUrl: "https://ionscale.example.com", fetcher: failingFetcher });

  try {
    await client.getVersion();
    throw new Error("expected call to reject");
  } catch (error) {
    return error as ConnectError;
  }
}

function encodeConnectStream(messages: unknown[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const frames: Uint8Array[] = [];

  for (const message of messages) {
    frames.push(encodeFrame(0, message));
  }
  frames.push(encodeFrame(0b00000010, {}));

  function encodeFrame(flags: number, payload: unknown): Uint8Array {
    const json = encoder.encode(JSON.stringify(payload));
    const frame = new Uint8Array(5 + json.length);
    frame[0] = flags;
    new DataView(frame.buffer).setUint32(1, json.length, false);
    frame.set(json, 5);
    return frame;
  }

  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const frame of frames) {
        controller.enqueue(frame);
      }
      controller.close();
    },
  });
}
