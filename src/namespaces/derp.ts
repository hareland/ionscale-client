import type { ConnectTransport } from "../transport";
import { emptySchema } from "../schemas/common";
import {
  getDefaultDerpMapResponseSchema,
  getDerpMapRequestSchema,
  getDerpMapResponseSchema,
  setDerpMapRequestSchema,
  setDerpMapResponseSchema,
  resetDerpMapRequestSchema,
  resetDerpMapResponseSchema,
  type GetDefaultDerpMapResponse,
  type GetDerpMapRequest,
  type GetDerpMapResponse,
  type SetDerpMapRequest,
  type SetDerpMapResponse,
  type ResetDerpMapRequest,
  type ResetDerpMapResponse,
} from "../schemas/derp";

export class DerpNamespace {
  constructor(private readonly transport: ConnectTransport) {}

  /** Returns the default DERP map, base64-encoded. */
  async getDefault(): Promise<GetDefaultDerpMapResponse["value"]> {
    const response = await this.transport.call("GetDefaultDERPMap", emptySchema, getDefaultDerpMapResponseSchema, {});
    return response.value;
  }

  /** Returns the DERP map configured for a tailnet, base64-encoded. */
  async get(request: GetDerpMapRequest): Promise<GetDerpMapResponse["value"]> {
    const response = await this.transport.call(
      "GetDERPMap",
      getDerpMapRequestSchema,
      getDerpMapResponseSchema,
      request
    );
    return response.value;
  }

  /** Sets the DERP map for a tailnet and returns it, base64-encoded. */
  async set(request: SetDerpMapRequest): Promise<SetDerpMapResponse["value"]> {
    const response = await this.transport.call(
      "SetDERPMap",
      setDerpMapRequestSchema,
      setDerpMapResponseSchema,
      request
    );
    return response.value;
  }

  reset(request: ResetDerpMapRequest): Promise<ResetDerpMapResponse> {
    return this.transport.call("ResetDERPMap", resetDerpMapRequestSchema, resetDerpMapResponseSchema, request);
  }
}
