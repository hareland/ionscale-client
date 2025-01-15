import { z } from "zod";
import { int64, refSchema } from "./common";

export const clientConnectivitySchema = z.object({
  endpoints: z.array(z.string()).default([]),
});

export type ClientConnectivity = z.infer<typeof clientConnectivitySchema>;

export const machineSchema = z.object({
  id: int64,
  name: z.string(),
  ipv4: z.string(),
  ipv6: z.string(),
  ephemeral: z.boolean().default(false),
  lastSeen: z.string().optional(),
  connected: z.boolean().default(false),
  tailnet: refSchema.optional(),
  user: refSchema.optional(),
  tags: z.array(z.string()).default([]),
  clientVersion: z.string(),
  os: z.string(),
  clientConnectivity: clientConnectivitySchema.optional(),
  createdAt: z.string().optional(),
  expiresAt: z.string().optional(),
  keyExpiryDisabled: z.boolean().default(false),
  enabledRoutes: z.array(z.string()).default([]),
  advertisedRoutes: z.array(z.string()).default([]),
  advertisedExitNode: z.boolean().default(false),
  enabledExitNode: z.boolean().default(false),
  authorized: z.boolean().default(false),
});

export type Machine = z.infer<typeof machineSchema>;

export const listMachinesRequestSchema = z.object({
  tailnetId: int64,
});

export type ListMachinesRequest = z.input<typeof listMachinesRequestSchema>;

export const listMachinesResponseSchema = z.object({
  machines: z.array(machineSchema).default([]),
});

export type ListMachinesResponse = z.infer<typeof listMachinesResponseSchema>;

export const getMachineRequestSchema = z.object({
  machineId: int64,
});

export type GetMachineRequest = z.input<typeof getMachineRequestSchema>;

export const getMachineResponseSchema = z.object({
  machine: machineSchema.optional(),
});

export type GetMachineResponse = z.infer<typeof getMachineResponseSchema>;

export const deleteMachineRequestSchema = z.object({
  machineId: int64,
});

export type DeleteMachineRequest = z.input<typeof deleteMachineRequestSchema>;

export const deleteMachineResponseSchema = z.object({});

export type DeleteMachineResponse = z.infer<typeof deleteMachineResponseSchema>;

export const expireMachineRequestSchema = z.object({
  machineId: int64,
});

export type ExpireMachineRequest = z.input<typeof expireMachineRequestSchema>;

export const expireMachineResponseSchema = z.object({});

export type ExpireMachineResponse = z.infer<typeof expireMachineResponseSchema>;

export const setMachineKeyExpiryRequestSchema = z.object({
  machineId: int64,
  disabled: z.boolean().default(false),
});

export type SetMachineKeyExpiryRequest = z.input<typeof setMachineKeyExpiryRequestSchema>;

export const setMachineKeyExpiryResponseSchema = z.object({});

export type SetMachineKeyExpiryResponse = z.infer<typeof setMachineKeyExpiryResponseSchema>;

export const authorizeMachineRequestSchema = z.object({
  machineId: int64,
});

export type AuthorizeMachineRequest = z.input<typeof authorizeMachineRequestSchema>;

export const authorizeMachineResponseSchema = z.object({});

export type AuthorizeMachineResponse = z.infer<typeof authorizeMachineResponseSchema>;

export const setMachineNameRequestSchema = z.object({
  machineId: int64,
  useOsHostname: z.boolean().default(false),
  name: z.string().default(""),
});

export type SetMachineNameRequest = z.input<typeof setMachineNameRequestSchema>;

export const setMachineNameResponseSchema = z.object({});

export type SetMachineNameResponse = z.infer<typeof setMachineNameResponseSchema>;
