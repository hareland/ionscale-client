import { z } from "zod";
import { int64 } from "./common";
import { dnsConfigInputSchema, dnsConfigSchema } from "./dns";

export const tailnetSchema = z.object({
  id: int64,
  name: z.string(),
  iamPolicy: z.string().default(""),
  aclPolicy: z.string().default(""),
  dnsConfig: dnsConfigSchema.optional(),
  serviceCollectionEnabled: z.boolean().default(false),
  fileSharingEnabled: z.boolean().default(false),
  sshEnabled: z.boolean().default(false),
  machineAuthorizationEnabled: z.boolean().default(false),
});

export type Tailnet = z.infer<typeof tailnetSchema>;

export const createTailnetRequestSchema = z.object({
  name: z.string(),
  iamPolicy: z.string().default(""),
  aclPolicy: z.string().default(""),
  dnsConfig: dnsConfigInputSchema.optional(),
  serviceCollectionEnabled: z.boolean().default(false),
  fileSharingEnabled: z.boolean().default(false),
  sshEnabled: z.boolean().default(false),
  machineAuthorizationEnabled: z.boolean().default(false),
});

export type CreateTailnetRequest = z.input<typeof createTailnetRequestSchema>;

export const createTailnetResponseSchema = z.object({
  tailnet: tailnetSchema.optional(),
});

export type CreateTailnetResponse = z.infer<typeof createTailnetResponseSchema>;

export const updateTailnetRequestSchema = z.object({
  tailnetId: int64,
  iamPolicy: z.string().default(""),
  aclPolicy: z.string().default(""),
  dnsConfig: dnsConfigInputSchema.optional(),
  serviceCollectionEnabled: z.boolean().default(false),
  fileSharingEnabled: z.boolean().default(false),
  sshEnabled: z.boolean().default(false),
  machineAuthorizationEnabled: z.boolean().default(false),
});

export type UpdateTailnetRequest = z.input<typeof updateTailnetRequestSchema>;

export const updateTailnetResponseSchema = z.object({
  tailnet: tailnetSchema.optional(),
});

export type UpdateTailnetResponse = z.infer<typeof updateTailnetResponseSchema>;

export const getTailnetRequestSchema = z.object({
  id: int64,
});

export type GetTailnetRequest = z.input<typeof getTailnetRequestSchema>;

export const getTailnetResponseSchema = z.object({
  tailnet: tailnetSchema.optional(),
});

export type GetTailnetResponse = z.infer<typeof getTailnetResponseSchema>;

export const listTailnetsRequestSchema = z.object({});

export type ListTailnetsRequest = z.input<typeof listTailnetsRequestSchema>;

export const listTailnetsResponseSchema = z.object({
  tailnet: z.array(tailnetSchema).default([]),
});

export type ListTailnetsResponse = z.infer<typeof listTailnetsResponseSchema>;

export const deleteTailnetRequestSchema = z.object({
  tailnetId: int64,
  force: z.boolean().default(false),
});

export type DeleteTailnetRequest = z.input<typeof deleteTailnetRequestSchema>;

export const deleteTailnetResponseSchema = z.object({});

export type DeleteTailnetResponse = z.infer<typeof deleteTailnetResponseSchema>;

const tailnetIdRequestSchema = z.object({
  tailnetId: int64,
});

const emptyResponseSchema = z.object({});

export const enableFileSharingRequestSchema = tailnetIdRequestSchema;
export type EnableFileSharingRequest = z.input<typeof enableFileSharingRequestSchema>;
export const enableFileSharingResponseSchema = emptyResponseSchema;
export type EnableFileSharingResponse = z.infer<typeof enableFileSharingResponseSchema>;

export const disableFileSharingRequestSchema = tailnetIdRequestSchema;
export type DisableFileSharingRequest = z.input<typeof disableFileSharingRequestSchema>;
export const disableFileSharingResponseSchema = emptyResponseSchema;
export type DisableFileSharingResponse = z.infer<typeof disableFileSharingResponseSchema>;

export const enableServiceCollectionRequestSchema = tailnetIdRequestSchema;
export type EnableServiceCollectionRequest = z.input<typeof enableServiceCollectionRequestSchema>;
export const enableServiceCollectionResponseSchema = emptyResponseSchema;
export type EnableServiceCollectionResponse = z.infer<typeof enableServiceCollectionResponseSchema>;

export const disableServiceCollectionRequestSchema = tailnetIdRequestSchema;
export type DisableServiceCollectionRequest = z.input<typeof disableServiceCollectionRequestSchema>;
export const disableServiceCollectionResponseSchema = emptyResponseSchema;
export type DisableServiceCollectionResponse = z.infer<typeof disableServiceCollectionResponseSchema>;

export const enableSshRequestSchema = tailnetIdRequestSchema;
export type EnableSshRequest = z.input<typeof enableSshRequestSchema>;
export const enableSshResponseSchema = emptyResponseSchema;
export type EnableSshResponse = z.infer<typeof enableSshResponseSchema>;

export const disableSshRequestSchema = tailnetIdRequestSchema;
export type DisableSshRequest = z.input<typeof disableSshRequestSchema>;
export const disableSshResponseSchema = emptyResponseSchema;
export type DisableSshResponse = z.infer<typeof disableSshResponseSchema>;

export const enableMachineAuthorizationRequestSchema = tailnetIdRequestSchema;
export type EnableMachineAuthorizationRequest = z.input<typeof enableMachineAuthorizationRequestSchema>;
export const enableMachineAuthorizationResponseSchema = emptyResponseSchema;
export type EnableMachineAuthorizationResponse = z.infer<typeof enableMachineAuthorizationResponseSchema>;

export const disableMachineAuthorizationRequestSchema = tailnetIdRequestSchema;
export type DisableMachineAuthorizationRequest = z.input<typeof disableMachineAuthorizationRequestSchema>;
export const disableMachineAuthorizationResponseSchema = emptyResponseSchema;
export type DisableMachineAuthorizationResponse = z.infer<typeof disableMachineAuthorizationResponseSchema>;
