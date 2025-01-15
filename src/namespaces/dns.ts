import type { ConnectTransport } from "../transport";
import {
  getDnsConfigRequestSchema,
  getDnsConfigResponseSchema,
  setDnsConfigRequestSchema,
  setDnsConfigResponseSchema,
  type GetDnsConfigRequest,
  type SetDnsConfigRequest,
  type SetDnsConfigResponse,
  type DnsConfig,
} from "../schemas/dns";

export class DnsNamespace {
  constructor(private readonly transport: ConnectTransport) {}

  async get(request: GetDnsConfigRequest): Promise<DnsConfig | undefined> {
    const response = await this.transport.call(
      "GetDNSConfig",
      getDnsConfigRequestSchema,
      getDnsConfigResponseSchema,
      request
    );
    return response.config;
  }

  set(request: SetDnsConfigRequest): Promise<SetDnsConfigResponse> {
    return this.transport.call("SetDNSConfig", setDnsConfigRequestSchema, setDnsConfigResponseSchema, request);
  }
}
