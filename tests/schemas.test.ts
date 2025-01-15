import { describe, expect, it, vi } from "vitest";
import { duration, int64, refSchema } from "../src/schemas/common";
import { dnsConfigSchema } from "../src/schemas/dns";
import { tailnetSchema } from "../src/schemas/tailnets";
import { machineSchema } from "../src/schemas/machines";
import { authKeySchema, createAuthKeyRequestSchema } from "../src/schemas/auth-keys";
import { getAclPolicyResponseSchema } from "../src/schemas/acl";
import { getIamPolicyResponseSchema } from "../src/schemas/iam";

describe("int64", () => {
  it("normalizes numbers, strings and bigints to strings", () => {
    expect(int64.parse(42)).toBe("42");
    expect(int64.parse("42")).toBe("42");
    expect(int64.parse(42n)).toBe("42");
  });

  it("preserves precision for values outside the safe integer range when given as a string", () => {
    expect(int64.parse("18446744073709551615")).toBe("18446744073709551615");
  });
});

describe("refSchema", () => {
  it("parses a Ref message", () => {
    expect(refSchema.parse({ id: "1", name: "default" })).toEqual({ id: "1", name: "default" });
  });
});

describe("duration", () => {
  it("passes through an already-encoded duration string", () => {
    expect(duration.parse("3600s")).toBe("3600s");
    expect(duration.parse("1.5s")).toBe("1.5s");
  });

  it("converts a plain number of seconds", () => {
    expect(duration.parse(3600)).toBe("3600s");
  });

  it("converts a Date to a duration relative to now", () => {
    const nowMs = new Date("2026-01-01T00:00:00Z").getTime();
    const later = new Date("2026-01-01T01:00:00Z");
    vi.spyOn(Date, "now").mockReturnValue(nowMs);
    expect(duration.parse(later)).toBe("3600s");
    vi.restoreAllMocks();
  });

  it("converts an ISO date/time string to a duration relative to now", () => {
    const nowMs = new Date("2026-01-01T00:00:00Z").getTime();
    vi.spyOn(Date, "now").mockReturnValue(nowMs);
    expect(duration.parse("2026-01-01T01:00:00Z")).toBe("3600s");
    vi.restoreAllMocks();
  });

  it("rejects invalid duration values", () => {
    expect(() => duration.parse("not-a-date")).toThrow();
  });
});

describe("dnsConfigSchema", () => {
  it("applies defaults for omitted fields", () => {
    expect(dnsConfigSchema.parse({})).toEqual({
      magicDns: false,
      overrideLocalDns: false,
      nameservers: [],
      routes: {},
      magicDnsSuffix: "",
      httpsCerts: false,
      searchDomains: [],
    });
  });

  it("parses a fully populated DNS config", () => {
    const input = {
      magicDns: true,
      overrideLocalDns: true,
      nameservers: ["1.1.1.1"],
      routes: { "example.com": { routes: ["10.0.0.0/24"] } },
      magicDnsSuffix: "ts.net",
      httpsCerts: true,
      searchDomains: ["example.com"],
    };
    expect(dnsConfigSchema.parse(input)).toEqual(input);
  });
});

describe("tailnetSchema", () => {
  it("normalizes the tailnet id and applies boolean defaults", () => {
    const result = tailnetSchema.parse({
      id: 7,
      name: "default",
      iamPolicy: "",
      aclPolicy: "",
    });

    expect(result.id).toBe("7");
    expect(result.serviceCollectionEnabled).toBe(false);
    expect(result.fileSharingEnabled).toBe(false);
  });

  it("defaults iamPolicy and aclPolicy when omitted, as the server does for empty values", () => {
    const result = tailnetSchema.parse({
      id: 7,
      name: "default",
    });

    expect(result.iamPolicy).toBe("");
    expect(result.aclPolicy).toBe("");
  });
});

describe("machineSchema", () => {
  it("parses a machine referencing a tailnet and user", () => {
    const result = machineSchema.parse({
      id: "10",
      name: "my-machine",
      ipv4: "100.64.0.1",
      ipv6: "fd7a:115c:a1e0::1",
      clientVersion: "1.50.0",
      os: "linux",
      tailnet: { id: "1", name: "default" },
      user: { id: "2", name: "user@example.com" },
    });

    expect(result.tailnet?.id).toBe("1");
    expect(result.user?.id).toBe("2");
    expect(result.ephemeral).toBe(false);
    expect(result.tags).toEqual([]);
  });
});

describe("getAclPolicyResponseSchema", () => {
  it("defaults policy to an empty string when omitted", () => {
    expect(getAclPolicyResponseSchema.parse({})).toEqual({ policy: "" });
  });
});

describe("getIamPolicyResponseSchema", () => {
  it("defaults policy to an empty string when omitted", () => {
    expect(getIamPolicyResponseSchema.parse({})).toEqual({ policy: "" });
  });
});

describe("authKeySchema", () => {
  it("parses an auth key with optional expiry", () => {
    const result = authKeySchema.parse({
      id: "5",
      key: "abcdef",
      createdAt: "2024-01-01T00:00:00Z",
      tailnet: { id: "1", name: "default" },
    });

    expect(result.id).toBe("5");
    expect(result.ephemeral).toBe(false);
    expect(result.expiresAt).toBeUndefined();
  });
});

describe("createAuthKeyRequestSchema", () => {
  it("passes through an already-encoded duration string for expiry", () => {
    const result = createAuthKeyRequestSchema.parse({
      tailnetId: "1",
      expiry: "3600s",
    });

    expect(result.expiry).toBe("3600s");
  });

  it("converts an ISO date/time string expiry to a duration", () => {
    const nowMs = new Date("2026-01-01T00:00:00Z").getTime();
    vi.spyOn(Date, "now").mockReturnValue(nowMs);

    const result = createAuthKeyRequestSchema.parse({
      tailnetId: "1",
      expiry: "2026-01-01T01:00:00Z",
    });

    expect(result.expiry).toBe("3600s");
    vi.restoreAllMocks();
  });
});
