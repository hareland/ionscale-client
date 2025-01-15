import type { ConnectTransport } from "../transport";
import {
  listUsersRequestSchema,
  listUsersResponseSchema,
  deleteUserRequestSchema,
  deleteUserResponseSchema,
  type ListUsersRequest,
  type DeleteUserRequest,
  type DeleteUserResponse,
  type User,
} from "../schemas/users";

export class UsersNamespace {
  constructor(private readonly transport: ConnectTransport) {}

  async list(request: ListUsersRequest): Promise<User[]> {
    const response = await this.transport.call("ListUsers", listUsersRequestSchema, listUsersResponseSchema, request);
    return response.users;
  }

  delete(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    return this.transport.call("DeleteUser", deleteUserRequestSchema, deleteUserResponseSchema, request);
  }
}
