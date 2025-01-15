import type { ConnectTransport } from "../transport";
import {
  getMachineRoutesRequestSchema,
  getMachineRoutesResponseSchema,
  enableMachineRoutesRequestSchema,
  enableMachineRoutesResponseSchema,
  disableMachineRoutesRequestSchema,
  disableMachineRoutesResponseSchema,
  enableExitNodeRequestSchema,
  enableExitNodeResponseSchema,
  disableExitNodeRequestSchema,
  disableExitNodeResponseSchema,
  type GetMachineRoutesRequest,
  type GetMachineRoutesResponse,
  type EnableMachineRoutesRequest,
  type EnableMachineRoutesResponse,
  type DisableMachineRoutesRequest,
  type DisableMachineRoutesResponse,
  type EnableExitNodeRequest,
  type EnableExitNodeResponse,
  type DisableExitNodeRequest,
  type DisableExitNodeResponse,
} from "../schemas/routes";

export class RoutesNamespace {
  constructor(private readonly transport: ConnectTransport) {}

  get(request: GetMachineRoutesRequest): Promise<GetMachineRoutesResponse> {
    return this.transport.call(
      "GetMachineRoutes",
      getMachineRoutesRequestSchema,
      getMachineRoutesResponseSchema,
      request
    );
  }

  enable(request: EnableMachineRoutesRequest): Promise<EnableMachineRoutesResponse> {
    return this.transport.call(
      "EnableMachineRoutes",
      enableMachineRoutesRequestSchema,
      enableMachineRoutesResponseSchema,
      request
    );
  }

  disable(request: DisableMachineRoutesRequest): Promise<DisableMachineRoutesResponse> {
    return this.transport.call(
      "DisableMachineRoutes",
      disableMachineRoutesRequestSchema,
      disableMachineRoutesResponseSchema,
      request
    );
  }

  enableExitNode(request: EnableExitNodeRequest): Promise<EnableExitNodeResponse> {
    return this.transport.call(
      "EnableExitNode",
      enableExitNodeRequestSchema,
      enableExitNodeResponseSchema,
      request
    );
  }

  disableExitNode(request: DisableExitNodeRequest): Promise<DisableExitNodeResponse> {
    return this.transport.call(
      "DisableExitNode",
      disableExitNodeRequestSchema,
      disableExitNodeResponseSchema,
      request
    );
  }
}
