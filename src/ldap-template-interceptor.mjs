import { Interceptor } from "@kronos-integration/interceptor";
import { mergeAttributes, createAttributes } from "model-attributes";
import { expand } from "./util.mjs";

/**
 * Map params into ldap requests.
 */
export class LDAPTemplateInterceptor extends Interceptor {
  /**
   * @return {string} 'ldap-template'
   */
  static get name() {
    return "ldap-template";
  }

  static get configurationAttributes() {
    return mergeAttributes(
      createAttributes({
        template: {
          description: "request template",
          default: {},
          type: "object"
        }
      }),
      Interceptor.configurationAttributes
    );
  }

  async receive(endpoint, next, params) {
    return next(
      Object.fromEntries(
        Object.entries(this.template).map(([k, v]) => [k, expand(v, params)])
      )
    );
  }
}
