import type { ConnectTransport } from "../transport";
import { emptySchema } from "../schemas/common";
import { authenticateResponseSchema, type AuthenticateResponse } from "../schemas/auth";

export class AuthNamespace {
  constructor(private readonly transport: ConnectTransport) {}

  /**
   * Initiates an interactive login flow. The server responds with a stream
   * of `AuthenticateResponse` messages: the first one carries the URL the
   * user should visit to authenticate, subsequent ones are sent once the
   * flow completes (carrying the issued token).
   */
  authenticate(): AsyncGenerator<AuthenticateResponse> {
    return this.transport.callServerStream("Authenticate", emptySchema, authenticateResponseSchema, {});
  }
}
