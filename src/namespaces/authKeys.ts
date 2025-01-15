import type { ConnectTransport } from "../transport";
import {
  getAuthKeyRequestSchema,
  getAuthKeyResponseSchema,
  createAuthKeyRequestSchema,
  createAuthKeyResponseSchema,
  deleteAuthKeyRequestSchema,
  deleteAuthKeyResponseSchema,
  listAuthKeysRequestSchema,
  listAuthKeysResponseSchema,
  type GetAuthKeyRequest,
  type CreateAuthKeyRequest,
  type CreateAuthKeyResponse,
  type DeleteAuthKeyRequest,
  type DeleteAuthKeyResponse,
  type ListAuthKeysRequest,
  type AuthKey,
} from "../schemas/auth-keys";

export class AuthKeysNamespace {
  constructor(private readonly transport: ConnectTransport) {}

  async get(request: GetAuthKeyRequest): Promise<AuthKey | undefined> {
    const response = await this.transport.call(
      "GetAuthKey",
      getAuthKeyRequestSchema,
      getAuthKeyResponseSchema,
      request
    );
    return response.authKey;
  }

  create(request: CreateAuthKeyRequest): Promise<CreateAuthKeyResponse> {
    return this.transport.call("CreateAuthKey", createAuthKeyRequestSchema, createAuthKeyResponseSchema, request);
  }

  delete(request: DeleteAuthKeyRequest): Promise<DeleteAuthKeyResponse> {
    return this.transport.call("DeleteAuthKey", deleteAuthKeyRequestSchema, deleteAuthKeyResponseSchema, request);
  }

  async list(request: ListAuthKeysRequest): Promise<AuthKey[]> {
    const response = await this.transport.call(
      "ListAuthKeys",
      listAuthKeysRequestSchema,
      listAuthKeysResponseSchema,
      request
    );
    return response.authKeys;
  }
}
