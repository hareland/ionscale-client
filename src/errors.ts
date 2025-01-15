import { z } from "zod";

/**
 * Error codes as defined by the Connect RPC protocol
 * (https://connectrpc.com/docs/protocol/#error-codes), used by the
 * ionscale admin API.
 */
export const CONNECT_ERROR_CODES = [
  "canceled",
  "unknown",
  "invalid_argument",
  "deadline_exceeded",
  "not_found",
  "already_exists",
  "permission_denied",
  "resource_exhausted",
  "failed_precondition",
  "aborted",
  "out_of_range",
  "unimplemented",
  "internal",
  "unavailable",
  "data_loss",
  "unauthenticated",
] as const;

export type ConnectErrorCode = (typeof CONNECT_ERROR_CODES)[number];

export const connectErrorPayloadSchema = z.object({
  code: z.enum(CONNECT_ERROR_CODES).catch("unknown"),
  message: z.string().default(""),
  details: z.array(z.unknown()).optional(),
});

export type ConnectErrorPayload = z.infer<typeof connectErrorPayloadSchema>;

/**
 * Error thrown when an ionscale RPC call fails, either because the server
 * returned a Connect protocol error, or because the response could not be
 * parsed/validated.
 */
export class ConnectError extends Error {
  readonly code: ConnectErrorCode;
  readonly httpStatus?: number;
  readonly details?: unknown[];
  readonly rawBody?: unknown;

  constructor(
    message: string,
    code: ConnectErrorCode = "unknown",
    options?: { httpStatus?: number; details?: unknown[]; rawBody?: unknown; cause?: unknown }
  ) {
    super(message, { cause: options?.cause });
    this.name = "ConnectError";
    this.code = code;
    this.httpStatus = options?.httpStatus;
    this.details = options?.details;
    this.rawBody = options?.rawBody;
  }

  static fromResponseBody(body: unknown, httpStatus?: number): ConnectError {
    const result = connectErrorPayloadSchema.safeParse(body);
    if (result.success) {
      return new ConnectError(result.data.message || "ionscale RPC call failed", result.data.code, {
        httpStatus,
        details: result.data.details,
        rawBody: body,
      });
    }
    return new ConnectError("ionscale RPC call failed", "unknown", { httpStatus, rawBody: body });
  }
}
