import { z } from "zod";
import { int64 } from "./common";

export const userSchema = z.object({
  id: int64,
  name: z.string(),
  role: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const listUsersRequestSchema = z.object({
  tailnetId: int64,
});

export type ListUsersRequest = z.input<typeof listUsersRequestSchema>;

export const listUsersResponseSchema = z.object({
  users: z.array(userSchema).default([]),
});

export type ListUsersResponse = z.infer<typeof listUsersResponseSchema>;

export const deleteUserRequestSchema = z.object({
  userId: int64,
});

export type DeleteUserRequest = z.input<typeof deleteUserRequestSchema>;

export const deleteUserResponseSchema = z.object({});

export type DeleteUserResponse = z.infer<typeof deleteUserResponseSchema>;
