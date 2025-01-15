import { z } from "zod";
import { int64 } from "./common";

export const getIamPolicyRequestSchema = z.object({
  tailnetId: int64,
});

export type GetIamPolicyRequest = z.input<typeof getIamPolicyRequestSchema>;

export const getIamPolicyResponseSchema = z.object({
  policy: z.string().default(""),
});

export type GetIamPolicyResponse = z.infer<typeof getIamPolicyResponseSchema>;

export const setIamPolicyRequestSchema = z.object({
  tailnetId: int64,
  policy: z.string(),
});

export type SetIamPolicyRequest = z.input<typeof setIamPolicyRequestSchema>;

export const setIamPolicyResponseSchema = z.object({});

export type SetIamPolicyResponse = z.infer<typeof setIamPolicyResponseSchema>;
