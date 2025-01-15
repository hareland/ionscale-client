import { ConnectError } from "./errors";

const FLAG_END_STREAM = 0b00000010;

interface EndStreamFrame {
  error?: { code?: string; message?: string; details?: unknown[] };
  metadata?: Record<string, string[]>;
}

/**
 * Parses a Connect RPC streaming response body
 * (https://connectrpc.com/docs/protocol/#streaming-rpcs) into individual
 * JSON messages. Each frame on the wire is length-prefixed: 1 byte of
 * flags, followed by a 4-byte big-endian length, followed by that many
 * bytes of JSON payload.
 */
export async function* readConnectStream(body: ReadableStream<Uint8Array>): AsyncGenerator<unknown> {
  const reader = body.getReader();
  let buffer = new Uint8Array(0);

  const append = (chunk: Uint8Array) => {
    const next = new Uint8Array(buffer.length + chunk.length);
    next.set(buffer, 0);
    next.set(chunk, buffer.length);
    buffer = next;
  };

  try {
    while (true) {
      // Ensure we have at least a 5-byte frame header buffered.
      while (buffer.length < 5) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer.length === 0) {
            return;
          }
          throw new ConnectError("Unexpected end of stream while reading frame header");
        }
        append(value);
      }

      const flags = buffer[0]!;
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      const length = view.getUint32(1, false);

      while (buffer.length < 5 + length) {
        const { done, value } = await reader.read();
        if (done) {
          throw new ConnectError("Unexpected end of stream while reading frame payload");
        }
        append(value);
      }

      const payload = buffer.slice(5, 5 + length);
      buffer = buffer.slice(5 + length);

      const text = new TextDecoder().decode(payload);
      const message: unknown = text.length > 0 ? JSON.parse(text) : {};

      if (flags & FLAG_END_STREAM) {
        const endStream = message as EndStreamFrame;
        if (endStream.error) {
          throw new ConnectError(
            endStream.error.message ?? "ionscale stream ended with an error",
            (endStream.error.code as never) ?? "unknown",
            { details: endStream.error.details }
          );
        }
        return;
      }

      yield message;
    }
  } finally {
    reader.releaseLock();
  }
}
