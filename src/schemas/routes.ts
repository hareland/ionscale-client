import { z } from "zod";
import { int64 } from "./common";

export const machineRoutesSchema = z.object({
  advertisedRoutes: z.array(z.string()).default([]),
  enabledRoutes: z.array(z.string()).default([]),
  advertisedExitNode: z.boolean().default(false),
  enabledExitNode: z.boolean().default(false),
});

export type MachineRoutes = z.infer<typeof machineRoutesSchema>;

export const getMachineRoutesRequestSchema = z.object({
  machineId: int64,
});

export type GetMachineRoutesRequest = z.input<typeof getMachineRoutesRequestSchema>;

export const getMachineRoutesResponseSchema = z.object({
  machineId: int64.optional(),
  routes: machineRoutesSchema.optional(),
});

export type GetMachineRoutesResponse = z.infer<typeof getMachineRoutesResponseSchema>;

export const enableMachineRoutesRequestSchema = z.object({
  machineId: int64,
  routes: z.array(z.string()).default([]),
  replace: z.boolean().default(false),
});

export type EnableMachineRoutesRequest = z.input<typeof enableMachineRoutesRequestSchema>;

export const enableMachineRoutesResponseSchema = z.object({
  machineId: int64.optional(),
  routes: machineRoutesSchema.optional(),
});

export type EnableMachineRoutesResponse = z.infer<typeof enableMachineRoutesResponseSchema>;

export const disableMachineRoutesRequestSchema = z.object({
  machineId: int64,
  routes: z.array(z.string()).default([]),
});

export type DisableMachineRoutesRequest = z.input<typeof disableMachineRoutesRequestSchema>;

export const disableMachineRoutesResponseSchema = z.object({
  machineId: int64.optional(),
  routes: machineRoutesSchema.optional(),
});

export type DisableMachineRoutesResponse = z.infer<typeof disableMachineRoutesResponseSchema>;

export const enableExitNodeRequestSchema = z.object({
  machineId: int64,
});

export type EnableExitNodeRequest = z.input<typeof enableExitNodeRequestSchema>;

export const enableExitNodeResponseSchema = z.object({
  machineId: int64.optional(),
  routes: machineRoutesSchema.optional(),
});

export type EnableExitNodeResponse = z.infer<typeof enableExitNodeResponseSchema>;

export const disableExitNodeRequestSchema = z.object({
  machineId: int64,
});

export type DisableExitNodeRequest = z.input<typeof disableExitNodeRequestSchema>;

export const disableExitNodeResponseSchema = z.object({
  machineId: int64.optional(),
  routes: machineRoutesSchema.optional(),
});

export type DisableExitNodeResponse = z.infer<typeof disableExitNodeResponseSchema>;
