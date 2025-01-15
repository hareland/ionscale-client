import { z } from "zod";
import { int64 } from "./common";

export const authenticateResponseSchema = z.object({
  authUrl: z.string(),
  token: z.string(),
  tailnetId: int64.optional(),
});

export type AuthenticateResponse = z.infer<typeof authenticateResponseSchema>;
