import { Client, Change, Attribute } from "ldapts";
import {
  prepareAttributesDefinitions,
  url_attribute,
  default_attribute
} from "pacc";
import { Service } from "@kronos-integration/service";
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

  static get description() {
    return "LDAP server access for bind/add/modify/del/query";
  }

  static attributes = prepareAttributesDefinitions(
    {
      url: {
        ...url_attribute,
        needsRestart: true,
        mandatory: true
      },
      entitlements: {
        description: "attributes to build a entitlement query",
        attributes: {
          bindDN: default_attribute,
          base: default_attribute,
          attribute: { ...default_attribute, default: "cn" },
          scope: { ...default_attribute, default: "sub" },
          filter: default_attribute
        }
      }
    },
    Service.attributes
  );

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
    const client = new Client({ url: this.url });
    if (request.bind) {
      await client.bind(request.bind.dn, request.bind.password);
    }

    return client;
  }

  async add(request) {
    let client;

    try {
      client = await this.prepareRequest(request);
      await client.add(request.dn, request.entry);
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
      await client.del(request.dn);
    } finally {
      if (client) {
        await client.unbind();
      }
    }
  }

  async modify(request) {
    let client;

    try {
      client = await this.prepareRequest(request);

      const changes = Object.entries(request.replace).map(
        ([type, values]) =>
          new Change({
            operation: "replace",
            modification: new Attribute({
              type,
              values: asArray(values)
            })
          })
      );

      console.log(request.dn, changes);
      await client.modify(request.dn, changes);
    } finally {
      if (client) {
        await client.unbind();
      }
    }
  }

  /**
   * Execute a query.
   * @param {Object} request
   * @return {Promise<Object>} result
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
   * @return {Promise<Set<string>>} entitlements
   */
  async authenticate(props) {
    const { username, password } = props;

    const client = new Client({ url: this.url });

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

function asArray(value) {
  return Array.isArray(value) ? value : value === undefined ? [] : [value];
}

export default ServiceLDAP;
