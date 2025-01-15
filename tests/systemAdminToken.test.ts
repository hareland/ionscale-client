import { describe, expect, it } from "vitest";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { generateSystemAdminToken } from "../src/systemAdminToken";

const SYSTEM_ADMIN_KEY = "1".repeat(63) + "2"; // 64 hex chars

/** Mirrors ionscale's server-side decryption (internal/token/token.go) so we
 * can verify the token this client produces is actually decodable. */
function decode(token: string, systemAdminKey: string) {
  expect(token.startsWith("st_")).toBe(true);
  const encoded = token.slice("st_".length);
  const ciphertext = bs58.decode(encoded);

  const secretKey = new Uint8Array(Buffer.from(systemAdminKey, "hex"));
  const keyPair = nacl.box.keyPair.fromSecretKey(secretKey);

  const nonce = ciphertext.slice(0, 24);
  const box = ciphertext.slice(24);
  const cleartext = nacl.box.open(box, nonce, keyPair.publicKey, keyPair.secretKey);
  expect(cleartext).not.toBeNull();

  return JSON.parse(Buffer.from(cleartext!).toString("utf8")) as {
    nonce: string;
    creation_time: string;
  };
}

describe("generateSystemAdminToken", () => {
  it("produces an `st_`-prefixed token decodable with the same key", () => {
    const token = generateSystemAdminToken(SYSTEM_ADMIN_KEY);
    const info = decode(token, SYSTEM_ADMIN_KEY);

    expect(info.nonce).toEqual(expect.any(String));
    expect(info.nonce).not.toContain("=");
    const creationTime = new Date(info.creation_time).getTime();
    expect(Number.isNaN(creationTime)).toBe(false);
    expect(Math.abs(Date.now() - creationTime)).toBeLessThan(5_000);
  });

  it("generates a fresh, different token on every call", () => {
    const first = generateSystemAdminToken(SYSTEM_ADMIN_KEY);
    const second = generateSystemAdminToken(SYSTEM_ADMIN_KEY);
    expect(first).not.toEqual(second);
  });

  it("cannot be decoded with a different system admin key", () => {
    const token = generateSystemAdminToken(SYSTEM_ADMIN_KEY);
    const otherKey = "3".repeat(63) + "4";
    expect(() => decode(token, otherKey)).toThrow();
  });

  it("rejects keys that are not 64 hex characters", () => {
    expect(() => generateSystemAdminToken("not-a-valid-key")).toThrow(/invalid system admin key/);
    expect(() => generateSystemAdminToken("ab")).toThrow(/invalid system admin key/);
  });
});
