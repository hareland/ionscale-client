import { z } from "zod";
import { int64 } from "./common";

export const getAclPolicyRequestSchema = z.object({
  tailnetId: int64,
});

export type GetAclPolicyRequest = z.input<typeof getAclPolicyRequestSchema>;

export const getAclPolicyResponseSchema = z.object({
  policy: z.string().default(""),
});

export type GetAclPolicyResponse = z.infer<typeof getAclPolicyResponseSchema>;

export const setAclPolicyRequestSchema = z.object({
  tailnetId: int64,
  policy: z.string(),
});

export type SetAclPolicyRequest = z.input<typeof setAclPolicyRequestSchema>;

export const setAclPolicyResponseSchema = z.object({});

export type SetAclPolicyResponse = z.infer<typeof setAclPolicyResponseSchema>;
