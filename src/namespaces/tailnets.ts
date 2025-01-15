import type { ConnectTransport } from "../transport";
import {
  createTailnetRequestSchema,
  createTailnetResponseSchema,
  updateTailnetRequestSchema,
  updateTailnetResponseSchema,
  getTailnetRequestSchema,
  getTailnetResponseSchema,
  listTailnetsRequestSchema,
  listTailnetsResponseSchema,
  deleteTailnetRequestSchema,
  deleteTailnetResponseSchema,
  enableFileSharingRequestSchema,
  enableFileSharingResponseSchema,
  disableFileSharingRequestSchema,
  disableFileSharingResponseSchema,
  enableServiceCollectionRequestSchema,
  enableServiceCollectionResponseSchema,
  disableServiceCollectionRequestSchema,
  disableServiceCollectionResponseSchema,
  enableSshRequestSchema,
  enableSshResponseSchema,
  disableSshRequestSchema,
  disableSshResponseSchema,
  enableMachineAuthorizationRequestSchema,
  enableMachineAuthorizationResponseSchema,
  disableMachineAuthorizationRequestSchema,
  disableMachineAuthorizationResponseSchema,
  type CreateTailnetRequest,
  type UpdateTailnetRequest,
  type GetTailnetRequest,
  type ListTailnetsRequest,
  type DeleteTailnetRequest,
  type DeleteTailnetResponse,
  type EnableFileSharingRequest,
  type EnableFileSharingResponse,
  type DisableFileSharingRequest,
  type DisableFileSharingResponse,
  type EnableServiceCollectionRequest,
  type EnableServiceCollectionResponse,
  type DisableServiceCollectionRequest,
  type DisableServiceCollectionResponse,
  type EnableSshRequest,
  type EnableSshResponse,
  type DisableSshRequest,
  type DisableSshResponse,
  type EnableMachineAuthorizationRequest,
  type EnableMachineAuthorizationResponse,
  type DisableMachineAuthorizationRequest,
  type DisableMachineAuthorizationResponse,
  type Tailnet,
} from "../schemas/tailnets";

export class TailnetsNamespace {
  constructor(private readonly transport: ConnectTransport) {}

  async create(request: CreateTailnetRequest): Promise<Tailnet | undefined> {
    const response = await this.transport.call(
      "CreateTailnet",
      createTailnetRequestSchema,
      createTailnetResponseSchema,
      request
    );
    return response.tailnet;
  }

  async update(request: UpdateTailnetRequest): Promise<Tailnet | undefined> {
    const response = await this.transport.call(
      "UpdateTailnet",
      updateTailnetRequestSchema,
      updateTailnetResponseSchema,
      request
    );
    return response.tailnet;
  }

  async get(request: GetTailnetRequest): Promise<Tailnet | undefined> {
    const response = await this.transport.call(
      "GetTailnet",
      getTailnetRequestSchema,
      getTailnetResponseSchema,
      request
    );
    return response.tailnet;
  }

  async list(request: ListTailnetsRequest = {}): Promise<Tailnet[]> {
    const response = await this.transport.call(
      "ListTailnets",
      listTailnetsRequestSchema,
      listTailnetsResponseSchema,
      request
    );
    return response.tailnet;
  }

  delete(request: DeleteTailnetRequest): Promise<DeleteTailnetResponse> {
    return this.transport.call("DeleteTailnet", deleteTailnetRequestSchema, deleteTailnetResponseSchema, request);
  }

  enableFileSharing(request: EnableFileSharingRequest): Promise<EnableFileSharingResponse> {
    return this.transport.call(
      "EnableFileSharing",
      enableFileSharingRequestSchema,
      enableFileSharingResponseSchema,
      request
    );
  }

  disableFileSharing(request: DisableFileSharingRequest): Promise<DisableFileSharingResponse> {
    return this.transport.call(
      "DisableFileSharing",
      disableFileSharingRequestSchema,
      disableFileSharingResponseSchema,
      request
    );
  }

  enableServiceCollection(request: EnableServiceCollectionRequest): Promise<EnableServiceCollectionResponse> {
    return this.transport.call(
      "EnableServiceCollection",
      enableServiceCollectionRequestSchema,
      enableServiceCollectionResponseSchema,
      request
    );
  }

  disableServiceCollection(request: DisableServiceCollectionRequest): Promise<DisableServiceCollectionResponse> {
    return this.transport.call(
      "DisableServiceCollection",
      disableServiceCollectionRequestSchema,
      disableServiceCollectionResponseSchema,
      request
    );
  }

  enableSSH(request: EnableSshRequest): Promise<EnableSshResponse> {
    return this.transport.call("EnableSSH", enableSshRequestSchema, enableSshResponseSchema, request);
  }

  disableSSH(request: DisableSshRequest): Promise<DisableSshResponse> {
    return this.transport.call("DisableSSH", disableSshRequestSchema, disableSshResponseSchema, request);
  }

  enableMachineAuthorization(request: EnableMachineAuthorizationRequest): Promise<EnableMachineAuthorizationResponse> {
    return this.transport.call(
      "EnableMachineAuthorization",
      enableMachineAuthorizationRequestSchema,
      enableMachineAuthorizationResponseSchema,
      request
    );
  }

  disableMachineAuthorization(
    request: DisableMachineAuthorizationRequest
  ): Promise<DisableMachineAuthorizationResponse> {
    return this.transport.call(
      "DisableMachineAuthorization",
      disableMachineAuthorizationRequestSchema,
      disableMachineAuthorizationResponseSchema,
      request
    );
  }
}
