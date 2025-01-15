import { z } from "zod";
import { duration, int64, refSchema } from "./common";

export const authKeySchema = z.object({
  id: int64,
  key: z.string(),
  ephemeral: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  expiresAt: z.string().optional(),
  tailnet: refSchema.optional(),
});

export type AuthKey = z.infer<typeof authKeySchema>;

export const getAuthKeyRequestSchema = z.object({
  authKeyId: int64,
});

export type GetAuthKeyRequest = z.input<typeof getAuthKeyRequestSchema>;

export const getAuthKeyResponseSchema = z.object({
  authKey: authKeySchema.optional(),
});

export type GetAuthKeyResponse = z.infer<typeof getAuthKeyResponseSchema>;

export const createAuthKeyRequestSchema = z.object({
  tailnetId: int64,
  ephemeral: z.boolean().default(false),
  /**
   * Protobuf `google.protobuf.Duration` encoded as e.g. `"3600s"`. For
   * convenience, a `number` (seconds), a `Date`, or an ISO 8601 date/time
   * string may also be provided and will be converted to the duration
   * format expected by the server.
   */
  expiry: duration.optional(),
  tags: z.array(z.string()).default([]),
  preAuthorized: z.boolean().default(false),
});

export type CreateAuthKeyRequest = z.input<typeof createAuthKeyRequestSchema>;

export const createAuthKeyResponseSchema = z.object({
  authKey: authKeySchema.optional(),
  value: z.string(),
});

export type CreateAuthKeyResponse = z.infer<typeof createAuthKeyResponseSchema>;

export const deleteAuthKeyRequestSchema = z.object({
  authKeyId: int64,
});

export type DeleteAuthKeyRequest = z.input<typeof deleteAuthKeyRequestSchema>;

export const deleteAuthKeyResponseSchema = z.object({});

export type DeleteAuthKeyResponse = z.infer<typeof deleteAuthKeyResponseSchema>;

export const listAuthKeysRequestSchema = z.object({
  tailnetId: int64,
});

export type ListAuthKeysRequest = z.input<typeof listAuthKeysRequestSchema>;

export const listAuthKeysResponseSchema = z.object({
  authKeys: z.array(authKeySchema).default([]),
});

export type ListAuthKeysResponse = z.infer<typeof listAuthKeysResponseSchema>;
