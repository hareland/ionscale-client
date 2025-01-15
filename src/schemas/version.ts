import { z } from "zod";

export const getVersionResponseSchema = z.object({
  version: z.string(),
  revision: z.string(),
});

export type GetVersionResponse = z.infer<typeof getVersionResponseSchema>;
