import type { ConnectTransport } from "../transport";
import {
  getMachineRequestSchema,
  getMachineResponseSchema,
  listMachinesRequestSchema,
  listMachinesResponseSchema,
  setMachineNameRequestSchema,
  setMachineNameResponseSchema,
  authorizeMachineRequestSchema,
  authorizeMachineResponseSchema,
  expireMachineRequestSchema,
  expireMachineResponseSchema,
  deleteMachineRequestSchema,
  deleteMachineResponseSchema,
  setMachineKeyExpiryRequestSchema,
  setMachineKeyExpiryResponseSchema,
  type GetMachineRequest,
  type ListMachinesRequest,
  type SetMachineNameRequest,
  type SetMachineNameResponse,
  type AuthorizeMachineRequest,
  type AuthorizeMachineResponse,
  type ExpireMachineRequest,
  type ExpireMachineResponse,
  type DeleteMachineRequest,
  type DeleteMachineResponse,
  type SetMachineKeyExpiryRequest,
  type SetMachineKeyExpiryResponse,
  type Machine,
} from "../schemas/machines";

export class MachinesNamespace {
  constructor(private readonly transport: ConnectTransport) {}

  async get(request: GetMachineRequest): Promise<Machine | undefined> {
    const response = await this.transport.call(
      "GetMachine",
      getMachineRequestSchema,
      getMachineResponseSchema,
      request
    );
    return response.machine;
  }

  async list(request: ListMachinesRequest): Promise<Machine[]> {
    const response = await this.transport.call(
      "ListMachines",
      listMachinesRequestSchema,
      listMachinesResponseSchema,
      request
    );
    return response.machines;
  }

  setName(request: SetMachineNameRequest): Promise<SetMachineNameResponse> {
    return this.transport.call(
      "SetMachineName",
      setMachineNameRequestSchema,
      setMachineNameResponseSchema,
      request
    );
  }

  authorize(request: AuthorizeMachineRequest): Promise<AuthorizeMachineResponse> {
    return this.transport.call(
      "AuthorizeMachine",
      authorizeMachineRequestSchema,
      authorizeMachineResponseSchema,
      request
    );
  }

  expire(request: ExpireMachineRequest): Promise<ExpireMachineResponse> {
    return this.transport.call("ExpireMachine", expireMachineRequestSchema, expireMachineResponseSchema, request);
  }

  delete(request: DeleteMachineRequest): Promise<DeleteMachineResponse> {
    return this.transport.call("DeleteMachine", deleteMachineRequestSchema, deleteMachineResponseSchema, request);
  }

  setKeyExpiry(request: SetMachineKeyExpiryRequest): Promise<SetMachineKeyExpiryResponse> {
    return this.transport.call(
      "SetMachineKeyExpiry",
      setMachineKeyExpiryRequestSchema,
      setMachineKeyExpiryResponseSchema,
      request
    );
  }
}
