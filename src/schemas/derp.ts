import { z } from "zod";
import { int64 } from "./common";

export const getDefaultDerpMapResponseSchema = z.object({
  /** Protobuf `bytes` encoded as a base64 string. */
  value: z.string(),
});

export type GetDefaultDerpMapResponse = z.infer<typeof getDefaultDerpMapResponseSchema>;

export const getDerpMapRequestSchema = z.object({
  tailnetId: int64,
});

export type GetDerpMapRequest = z.input<typeof getDerpMapRequestSchema>;

export const getDerpMapResponseSchema = z.object({
  value: z.string(),
});

export type GetDerpMapResponse = z.infer<typeof getDerpMapResponseSchema>;

export const setDerpMapRequestSchema = z.object({
  tailnetId: int64,
  /** Protobuf `bytes` encoded as a base64 string. */
  value: z.string(),
});

export type SetDerpMapRequest = z.input<typeof setDerpMapRequestSchema>;

export const setDerpMapResponseSchema = z.object({
  value: z.string(),
});

export type SetDerpMapResponse = z.infer<typeof setDerpMapResponseSchema>;

export const resetDerpMapRequestSchema = z.object({
  tailnetId: int64,
});

export type ResetDerpMapRequest = z.input<typeof resetDerpMapRequestSchema>;

export const resetDerpMapResponseSchema = z.object({});

export type ResetDerpMapResponse = z.infer<typeof resetDerpMapResponseSchema>;
