import { ofetch, FetchError, type $Fetch } from "ofetch";
import type { z, ZodType } from "zod";
import { ConnectError } from "./errors";
import { readConnectStream } from "./stream";
import { generateSystemAdminToken } from "./systemAdminToken";

const CONNECT_PROTOCOL_VERSION = "1";

/**
 * Resolves a bearer token, which may be provided as a static string, or as a
 * (possibly async) function so that callers can implement token refresh,
 * short-lived credentials, etc.
 */
export type TokenProvider = string | (() => string | undefined | Promise<string | undefined>);

export interface ConnectTransportOptions {
  /** Base URL of the ionscale server, e.g. `https://ionscale.example.com`. */
  baseUrl: string;
  /** Credential used to authenticate requests, or a provider function. */
  token?: TokenProvider;
  /**
   * The system admin key configured on the ionscale server (e.g. via
   * `IONSCALE_SYSTEM_ADMIN_KEY`), as a 64-character hex-encoded string.
   *
   * This is *not* a bearer token itself: it is used to sign a fresh,
   * short-lived admin token for every request, mirroring how the official
   * `ionscale` CLI authenticates. Prefer this over `token` when using the
   * system admin key described at
   * https://jsiebens.github.io/ionscale/getting-started/#option-1-using-the-system-admin-key.
   * Takes precedence over `token` when both are provided.
   */
  systemAdminKey?: string;
  /** Additional headers to send with every request. */
  headers?: Record<string, string>;
  /**
   * Custom `ofetch` instance to use for requests. Mainly useful for testing,
   * where a mocked fetcher can be injected instead of performing real HTTP
   * requests.
   */
  fetcher?: $Fetch;
}

function stripTrailingSlashes(url: string): string {
  let end = url.length;
  while (end > 0 && url[end - 1] === "/") {
    end -= 1;
  }
  return url.slice(0, end);
}

async function resolveAuthToken(
  token: TokenProvider | undefined,
  systemAdminKey: string | undefined
): Promise<string | undefined> {
  if (systemAdminKey) {
    return generateSystemAdminToken(systemAdminKey);
  }
  if (typeof token === "function") {
    return token();
  }
  return token;
}

/**
 * Low-level Connect RPC transport used by the namespaced resource clients
 * (e.g. `client.tailnets`, `client.machines`) to talk to the
 * `ionscale.v1.IonscaleService`.
 *
 * @internal exposed for advanced use-cases / testing, prefer the dedicated
 * methods on `IonscaleClient`'s namespaces instead.
 */
export class ConnectTransport {
  private readonly baseUrl: string;
  private readonly token: TokenProvider | undefined;
  private readonly systemAdminKey: string | undefined;
  private readonly headers: Record<string, string>;
  private readonly fetcher: $Fetch;

  constructor(options: ConnectTransportOptions) {
    this.baseUrl = stripTrailingSlashes(options.baseUrl);
    this.token = options.token;
    this.systemAdminKey = options.systemAdminKey;
    this.headers = options.headers ?? {};
    this.fetcher = options.fetcher ?? ofetch;
  }

  /** Performs a unary Connect RPC call against the `IonscaleService`. */
  async call<TReqSchema extends ZodType, TResSchema extends ZodType>(
    method: string,
    requestSchema: TReqSchema,
    responseSchema: TResSchema,
    request: z.input<TReqSchema>
  ): Promise<z.output<TResSchema>> {
    const parsedRequest = requestSchema.parse(request);
    const token = await resolveAuthToken(this.token, this.systemAdminKey);

    let raw: unknown;
    try {
      raw = await this.fetcher(`${this.baseUrl}/ionscale.v1.IonscaleService/${method}`, {
        method: "POST",
        body: parsedRequest as Record<string, unknown>,
        headers: {
          "content-type": "application/json",
          "connect-protocol-version": CONNECT_PROTOCOL_VERSION,
          ...(token ? { authorization: "Bearer " + token } : {}),
          ...this.headers,
        },
      });
    } catch (error) {
      if (error instanceof FetchError) {
        throw ConnectError.fromResponseBody(error.data, error.status);
      }
      throw error;
    }

    const result = responseSchema.safeParse(raw);
    if (!result.success) {
      throw new ConnectError(`Failed to parse response for ${method}: ${result.error.message}`, "unknown", {
        rawBody: raw,
        cause: result.error,
      });
    }
    return result.data;
  }

  /**
   * Performs a server-streaming Connect RPC call against the
   * `IonscaleService`, yielding each parsed message from the server as it
   * arrives.
   */
  async *callServerStream<TReqSchema extends ZodType, TResSchema extends ZodType>(
    method: string,
    requestSchema: TReqSchema,
    responseSchema: TResSchema,
    request: z.input<TReqSchema>
  ): AsyncGenerator<z.output<TResSchema>> {
    const parsedRequest = requestSchema.parse(request);
    const token = await resolveAuthToken(this.token, this.systemAdminKey);

    let response: Awaited<ReturnType<$Fetch["raw"]>>;
    try {
      response = await this.fetcher.raw(`${this.baseUrl}/ionscale.v1.IonscaleService/${method}`, {
        method: "POST",
        body: parsedRequest as Record<string, unknown>,
        responseType: "stream",
        headers: {
          "content-type": "application/connect+json",
          "connect-protocol-version": CONNECT_PROTOCOL_VERSION,
          ...(token ? { authorization: "Bearer " + token } : {}),
          ...this.headers,
        },
      });
    } catch (error) {
      if (error instanceof FetchError) {
        throw ConnectError.fromResponseBody(error.data, error.status);
      }
      throw error;
    }

    const body = response._data ?? response.body;
    if (!body) {
      return;
    }

    for await (const message of readConnectStream(body as ReadableStream<Uint8Array>)) {
      const result = responseSchema.safeParse(message);
      if (!result.success) {
        throw new ConnectError(`Failed to parse streamed response for ${method}: ${result.error.message}`, "unknown", {
          rawBody: message,
          cause: result.error,
        });
      }
      yield result.data;
    }
  }
}
