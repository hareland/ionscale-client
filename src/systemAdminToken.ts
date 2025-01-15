import { randomBytes } from "node:crypto";
import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * ionscale prefixes short-lived, self-generated system admin tokens with
 * `st_` (see https://github.com/jsiebens/ionscale internal/token/token.go).
 */
const SYSTEM_ADMIN_TOKEN_PREFIX = "st_";

/**
 * The system admin key configured on an ionscale server (e.g. via
 * `IONSCALE_SYSTEM_ADMIN_KEY`) is *not* itself a bearer token. It is a
 * 32-byte, hex-encoded curve25519 private key that must be used to sign a
 * fresh, short-lived token (valid for about a minute) for every single
 * request - exactly like the official `ionscale` CLI does. Sending the raw
 * key as a static bearer token in the `Authorization` header, as this client
 * used to do, is rejected by the server with "invalid token".
 */
function parsePrivateKey(systemAdminKey: string): Uint8Array {
  const trimmed = systemAdminKey.trim();
  if (!/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    throw new Error("invalid system admin key: expected a 64-character hex-encoded private key");
  }

  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(trimmed.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function base64RawStd(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64").replace(/=+$/, "");
}

/**
 * Generates a new, signed system admin token from the given system admin
 * key. The resulting token is only valid for a short period of time (about
 * a minute, mirroring ionscale's own drift compensation), so this must be
 * called again for every request rather than being cached and reused.
 */
export function generateSystemAdminToken(systemAdminKey: string): string {
  const secretKey = parsePrivateKey(systemAdminKey);
  const keyPair = nacl.box.keyPair.fromSecretKey(secretKey);

  const info = {
    nonce: base64RawStd(randomBytes(16)),
    creation_time: new Date().toISOString(),
  };
  const cleartext = new TextEncoder().encode(JSON.stringify(info));

  const sealNonce = randomBytes(24);
  const sealed = nacl.box(cleartext, sealNonce, keyPair.publicKey, keyPair.secretKey);

  const ciphertext = new Uint8Array(sealNonce.length + sealed.length);
  ciphertext.set(sealNonce, 0);
  ciphertext.set(sealed, sealNonce.length);

  return SYSTEM_ADMIN_TOKEN_PREFIX + bs58.encode(ciphertext);
}
