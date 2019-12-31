import ldapts from "ldapts";
import { mergeAttributes, createAttributes } from "model-attributes";
import { Service } from "@kronos-integration/service";

/**
 * LDAP
 */
export class ServiceLDAP extends Service {
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
      search: {
        receive: "search"
      }
    };
  }

  async _start() {
    await super.start();
    this.client = new ldapts.Client({ url: this.url });
  }

  async _stop() {
    delete this.client;
    return super._stop();
  }

  async search(query) {
    await this.start();

    try {
      await this.client.bind(query.bindDN, query.password);
      return await this.client.search(query.base, query);
    //  return entries;
    } finally {
      await this.client.unbind();
    }
  }

  /**
   * authorize with username and password
   * @param {Object} props
   * @param {string} props.username
   * @param {string} props.password
   * @return {Set<string>} entitlements
   */
  async authenticate(props) {
    const { username, password } = props;

    await this.start();

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

      await this.client.bind(bindDN, password);

      const attribute = expand(this.entitlements.attribute);

      const searchOptions = {
        scope: this.entitlements.scope,
        filter: expand(this.entitlements.filter),
        attributes: [attribute]
      };

      const base = expand(this.entitlements.base);

      this.trace(`search ${base} ${JSON.stringify(searchOptions)}`);

      const { searchEntries } = await this.client.search(base, searchOptions);

      const entitlements = new Set(searchEntries.map(e => e[attribute]));

      this.trace(`entitlements ${[...entitlements]}`);

      return { username, entitlements };
    } finally {
      await this.client.unbind();
    }
  }
}

export default ServiceLDAP;
