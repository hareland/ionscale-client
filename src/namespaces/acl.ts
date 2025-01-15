import type { ConnectTransport } from "../transport";
import {
  getAclPolicyRequestSchema,
  getAclPolicyResponseSchema,
  setAclPolicyRequestSchema,
  setAclPolicyResponseSchema,
  type GetAclPolicyRequest,
  type GetAclPolicyResponse,
  type SetAclPolicyRequest,
  type SetAclPolicyResponse,
} from "../schemas/acl";

export class AclNamespace {
  constructor(private readonly transport: ConnectTransport) {}

  async get(request: GetAclPolicyRequest): Promise<GetAclPolicyResponse["policy"]> {
    const response = await this.transport.call(
      "GetACLPolicy",
      getAclPolicyRequestSchema,
      getAclPolicyResponseSchema,
      request
    );
    return response.policy;
  }

  set(request: SetAclPolicyRequest): Promise<SetAclPolicyResponse> {
    return this.transport.call("SetACLPolicy", setAclPolicyRequestSchema, setAclPolicyResponseSchema, request);
  }
}
