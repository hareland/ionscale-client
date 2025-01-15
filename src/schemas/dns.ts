import { z } from "zod";
import { int64 } from "./common";

export const dnsRoutesSchema = z.object({
  routes: z.array(z.string()).default([]),
});

export type DnsRoutes = z.infer<typeof dnsRoutesSchema>;

export const dnsConfigSchema = z.object({
  magicDns: z.boolean().default(false),
  overrideLocalDns: z.boolean().default(false),
  nameservers: z.array(z.string()).default([]),
  routes: z.record(z.string(), dnsRoutesSchema).default({}),
  magicDnsSuffix: z.string().default(""),
  httpsCerts: z.boolean().default(false),
  searchDomains: z.array(z.string()).default([]),
});

export type DnsConfig = z.infer<typeof dnsConfigSchema>;

export const dnsConfigInputSchema = dnsConfigSchema.partial();

export type DnsConfigInput = z.infer<typeof dnsConfigInputSchema>;

export const getDnsConfigRequestSchema = z.object({
  tailnetId: int64,
});

export type GetDnsConfigRequest = z.input<typeof getDnsConfigRequestSchema>;

export const getDnsConfigResponseSchema = z.object({
  config: dnsConfigSchema.optional(),
});

export type GetDnsConfigResponse = z.infer<typeof getDnsConfigResponseSchema>;

export const setDnsConfigRequestSchema = z.object({
  tailnetId: int64,
  config: dnsConfigInputSchema,
});

export type SetDnsConfigRequest = z.input<typeof setDnsConfigRequestSchema>;

export const setDnsConfigResponseSchema = z.object({
  config: dnsConfigSchema.optional(),
  message: z.string().default(""),
});

export type SetDnsConfigResponse = z.infer<typeof setDnsConfigResponseSchema>;
