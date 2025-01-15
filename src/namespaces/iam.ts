import type { ConnectTransport } from "../transport";
import {
  getIamPolicyRequestSchema,
  getIamPolicyResponseSchema,
  setIamPolicyRequestSchema,
  setIamPolicyResponseSchema,
  type GetIamPolicyRequest,
  type GetIamPolicyResponse,
  type SetIamPolicyRequest,
  type SetIamPolicyResponse,
} from "../schemas/iam";

export class IamNamespace {
  constructor(private readonly transport: ConnectTransport) {}

  async get(request: GetIamPolicyRequest): Promise<GetIamPolicyResponse["policy"]> {
    const response = await this.transport.call(
      "GetIAMPolicy",
      getIamPolicyRequestSchema,
      getIamPolicyResponseSchema,
      request
    );
    return response.policy;
  }

  set(request: SetIamPolicyRequest): Promise<SetIamPolicyResponse> {
    return this.transport.call("SetIAMPolicy", setIamPolicyRequestSchema, setIamPolicyResponseSchema, request);
  }
}
