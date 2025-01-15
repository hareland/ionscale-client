import { emptySchema } from "./schemas/common";
import { getVersionResponseSchema, type GetVersionResponse } from "./schemas/version";
import { ConnectTransport, type ConnectTransportOptions } from "./transport";
import { AuthNamespace } from "./namespaces/auth";
import { DerpNamespace } from "./namespaces/derp";
import { TailnetsNamespace } from "./namespaces/tailnets";
import { DnsNamespace } from "./namespaces/dns";
import { IamNamespace } from "./namespaces/iam";
import { AclNamespace } from "./namespaces/acl";
import { AuthKeysNamespace } from "./namespaces/authKeys";
import { UsersNamespace } from "./namespaces/users";
import { MachinesNamespace } from "./namespaces/machines";
import { RoutesNamespace } from "./namespaces/routes";

export type { TokenProvider } from "./transport";
export type IonscaleClientOptions = ConnectTransportOptions;

/**
 * TypeScript client for the ionscale admin RPC API
 * (https://github.com/jsiebens/ionscale), implementing the Connect RPC
 * protocol (https://connectrpc.com/docs/protocol) used by the
 * `ionscale.v1.IonscaleService`.
 *
 * RPCs are grouped into namespaced resource clients mirroring the shape of
 * the API, e.g. `client.tailnets.list()`, `client.machines.get(...)`.
 */
export class IonscaleClient {
  private readonly transport: ConnectTransport;

  /** Interactive login flow. */
  readonly auth: AuthNamespace;
  /** DERP map management. */
  readonly derp: DerpNamespace;
  /** Tailnet CRUD and feature toggles. */
  readonly tailnets: TailnetsNamespace;
  /** DNS configuration. */
  readonly dns: DnsNamespace;
  /** IAM policy management. */
  readonly iam: IamNamespace;
  /** ACL policy management. */
  readonly acl: AclNamespace;
  /** Auth key management. */
  readonly authKeys: AuthKeysNamespace;
  /** User management. */
  readonly users: UsersNamespace;
  /** Machine management. */
  readonly machines: MachinesNamespace;
  /** Subnet routes / exit nodes management. */
  readonly routes: RoutesNamespace;

  constructor(options: IonscaleClientOptions) {
    this.transport = new ConnectTransport(options);

    this.auth = new AuthNamespace(this.transport);
    this.derp = new DerpNamespace(this.transport);
    this.tailnets = new TailnetsNamespace(this.transport);
    this.dns = new DnsNamespace(this.transport);
    this.iam = new IamNamespace(this.transport);
    this.acl = new AclNamespace(this.transport);
    this.authKeys = new AuthKeysNamespace(this.transport);
    this.users = new UsersNamespace(this.transport);
    this.machines = new MachinesNamespace(this.transport);
    this.routes = new RoutesNamespace(this.transport);
  }

  // ---------------------------------------------------------------------
  // Version
  // ---------------------------------------------------------------------

  getVersion(): Promise<GetVersionResponse> {
    return this.transport.call("GetVersion", emptySchema, getVersionResponseSchema, {});
  }
}
