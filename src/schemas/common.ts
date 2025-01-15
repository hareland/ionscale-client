import { z } from "zod";

/**
 * Protobuf `uint64`/`int64`/`fixed64` fields are encoded as strings in the
 * Connect/protobuf JSON wire format (to avoid precision loss for values
 * outside the safe JS integer range). This schema accepts either a
 * `string`, `number` or `bigint` as input (for ergonomic client usage) and
 * always normalizes to a `string` so that it round-trips safely over the
 * wire and when parsing server responses.
 */
export const int64 = z
  .union([z.string(), z.number(), z.bigint()])
  .transform((value) => value.toString());

export type Int64 = z.infer<typeof int64>;

/**
 * Matches the protobuf JSON encoding of `google.protobuf.Duration`, e.g.
 * `"3600s"` or `"1.5s"`.
 */
const durationStringPattern = /^-?\d+(\.\d+)?s$/;

/**
 * Protobuf `google.protobuf.Duration` fields are encoded as strings suffixed
 * with `s` (e.g. `"3600s"`) in the Connect/protobuf JSON wire format. For
 * ergonomic client usage this schema also accepts:
 * - a plain `number`, interpreted as a number of seconds;
 * - a `Date` instance, converted to the number of seconds from now until
 *   that date;
 * - an ISO 8601 date/time `string` (e.g. `"2026-09-10T13:45"`), converted the
 *   same way as a `Date`.
 *
 * All inputs are normalized to the `"<seconds>s"` string format expected by
 * the server.
 */
export const duration = z
  .union([z.string(), z.number(), z.date()])
  .transform((value, ctx) => {
    if (typeof value === "number") {
      return `${value}s`;
    }

    if (typeof value === "string" && durationStringPattern.test(value)) {
      return value;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid duration value: ${JSON.stringify(value)}`,
      });
      return z.NEVER;
    }

    const seconds = (date.getTime() - Date.now()) / 1000;
    return `${seconds}s`;
  });

export type Duration = z.infer<typeof duration>;

/**
 * A reference to another resource (tailnet, user, ...), as returned by the
 * ionscale API. See `ionscale/v1/ref.proto`.
 */
export const refSchema = z.object({
  id: int64,
  name: z.string(),
});

export type Ref = z.infer<typeof refSchema>;

/**
 * Helper used for RPCs that don't take any request parameters or don't
 * return any response payload (protobuf `Empty`-like messages).
 */
export const emptySchema = z.object({}).strict();

export type Empty = z.infer<typeof emptySchema>;
