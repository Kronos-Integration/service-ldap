import ldapts from "ldapts";
import { mergeAttributes, createAttributes } from "model-attributes";
import { Service } from "@kronos-integration/service";

export { LDAPQueryInterceptor } from "./ldap-query-interceptor.mjs";

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
      change_password: {
        receive: "changePassword"
      },
      search: {
        receive: "search"
      }
    };
  }

  async changePassword(query) {
    const client = new ldapts.Client({ url: this.url });

    try {
      if (query.bindDN) {
        await client.bind(query.bindDN, query.password);
      }
      throw new Error("Not implemented");
    } finally {
      await client.unbind();
    }
  }

  /**
   * Execute a query.
   * @param {Object} query
   * @return {Object} result
   */
  async search(query) {
    const client = new ldapts.Client({ url: this.url });

    try {
      if (query.bindDN) {
        await client.bind(query.bindDN, query.password);
      }
      const json = await client.search(query.base, query);
      return json.searchEntries;
    } finally {
      await client.unbind();
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

    function expand(str) {
      return str.replace(/\{\{(\w+)\}\}/, (match, g1) =>
        values[g1] ? values[g1] : g1
      );
    }

    try {
      const bindDN = expand(this.entitlements.bindDN);

      this.trace(`bind ${bindDN} (${this.entitlements.bindDN})`);

      await client.bind(bindDN, password);

      const attribute = expand(this.entitlements.attribute);

      const searchOptions = {
        scope: this.entitlements.scope,
        filter: expand(this.entitlements.filter),
        attributes: [attribute]
      };

      const base = expand(this.entitlements.base);

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
