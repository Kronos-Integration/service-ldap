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
      const bindDN = expand(this.bindDN);

      this.trace(`bind ${bindDN} (${this.bindDN})`);
      await this.client.bind(bindDN, password);

      const searchOptions = {
        scope: this.entitlements.scope,
        filter: expand(this.entitlements.filter),
        attributes: [this.entitlements.attribute]
      };

      const base = expand(this.entitlements.base);

      this.trace(`search ${base} ${JSON.stringify(searchOptions)}`);

      const { searchEntries } = await this.client.search(base, searchOptions);

      const entitlements = new Set();

      searchEntries.forEach(e => {
        const entitlement = e[this.entitlements.attribute];
        entitlements.add(entitlement);
      });

      this.trace(`result ${[...entitlements]}`);

      return { username, entitlements };
    } finally {
      await this.client.unbind();
    }
  }
}

export default ServiceLDAP;
