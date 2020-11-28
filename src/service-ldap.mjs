import ldapts from "ldapts";
import { mergeAttributes, createAttributes } from "model-attributes";
import { Service } from "@kronos-integration/service";
export { LDAPTemplateInterceptor } from "./ldap-template-interceptor.mjs";
import { expand } from "./util.mjs";

/**
 * LDAP
 */
export class ServiceLDAP extends Service {
  /**
   * @return {string} 'ldap'
   */
  static get name() {
    return "ldap";
  }

  static get configurationAttributes() {
    return mergeAttributes(
      Service.configurationAttributes,
      createAttributes({
        url: {
          needsRestart: true,
          mandatory: true,
          type: "url"
        },
        bindDN: {
          type: "string"
        },
        entitlements: {
          description: "attributes to build a entitlement query",
          attributes: {
            bindDN: {
              type: "string"
            },
            base: {
              type: "string"
            },
            attribute: { default: "cn", type: "string" },
            scope: { default: "sub", type: "string" },
            filter: { type: "string" }
          }
        }
      })
    );
  }

  static get endpoints() {
    return {
      ...super.endpoints,
      authenticate: {
        receive: "authenticate"
      },
      add: {
        receive: "add"
      },
      del: {
        receive: "del"
      },
      modify: {
        receive: "modify"
      },
      search: {
        receive: "search"
      }
    };
  }

  async prepareRequest(request) {
    const client = new ldapts.Client({ url: this.url });
    if (request.bind) {
      await client.bind(request.bind.dn, request.bind.password);
    }

    return client;
  }

  async add(request) {
    let client;

    try {
      client = await this.prepareRequest(request);
      return client.add(request.dn, request);
    } finally {
      if (client) {
        await client.unbind();
      }
    }
  }

  async del(request) {
    let client;

    try {
      client = await this.prepareRequest(request);
      return client.del(request.dn, request);
    } finally {
      if (client) {
        await client.unbind();
      }
    }
  }

  async modify(request) {
    let client;

    try {
      client = await prepareRequest(request);
      return client.modify(
        request.dn,
        request.changes.map(
          change =>
            new ldapts.Change({
              operation: change.operation,
              modification: new ldapts.Attribute({
                type: "title",
                values: change.values
              })
            })
        )
      );
    } finally {
      if (client) {
        await client.unbind();
      }
    }
  }

  /**
   * Execute a query.
   * @param {Object} request
   * @return {Object} result
   */
  async search(request) {
    let client;

    try {
      client = await this.prepareRequest(request);
      const json = await client.search(request.base, request);
      return json.searchEntries;
    } finally {
      if (client) {
        await client.unbind();
      }
    }
  }

  /**
   * Authorize with username and password.
   * @param {Object} props
   * @param {string} props.username
   * @param {string} props.password
   * @return {Set<string>} entitlements
   */
  async authenticate(props) {
    const { username, password } = props;

    const client = new ldapts.Client({ url: this.url });

    const values = {
      username
    };

    try {
      const bindDN = expand(this.entitlements.bindDN, values);

      this.trace(`bind ${bindDN} (${this.entitlements.bindDN})`);

      await client.bind(bindDN, password);

      const attribute = expand(this.entitlements.attribute, values);

      const searchOptions = {
        scope: this.entitlements.scope,
        filter: expand(this.entitlements.filter, values),
        attributes: [attribute]
      };

      const base = expand(this.entitlements.base, values);

      this.trace(`search ${base} ${JSON.stringify(searchOptions)}`);

      const { searchEntries } = await client.search(base, searchOptions);

      const entitlements = new Set(searchEntries.map(e => e[attribute]));

      this.trace(`entitlements ${[...entitlements]}`);

      return { username, entitlements };
    } finally {
      await client.unbind();
    }
  }
}

export default ServiceLDAP;
