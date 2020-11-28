import test from "ava";
import {
  interceptorTest,
  dummyEndpoint
} from "@kronos-integration/test-interceptor";
import { LDAPTemplateInterceptor } from "@kronos-integration/service-ldap";

test(
  interceptorTest,
  LDAPTemplateInterceptor,
  undefined,
  { json: { type: "ldap-template", template: {} } },
  dummyEndpoint("e1"),
  [],
  query => 77,
  async (t, interceptor, endpoint, next, result, params) => {
    t.is(result, 77);
  }
);

test(
  interceptorTest,
  LDAPTemplateInterceptor,
  {
    template: {
      base: "ou=groups,dc=example,dc=de",
      scope: "sub",
      attributes: ["cn"],
      filter:
        "(&(objectclass=groupOfUniqueNames)(uniqueMember=uid={{user}},ou=accounts,dc=example,dc=de))"
    }
  },
  {
    json: {
      type: "ldap-template",
      template: {
        base: "ou=groups,dc=example,dc=de",
        scope: "sub",
        attributes: ["cn"],
        filter:
          "(&(objectclass=groupOfUniqueNames)(uniqueMember=uid={{user}},ou=accounts,dc=example,dc=de))"
      }
    }
  },
  dummyEndpoint("e1"),
  [{ user: "hugo" }],
  query => query,
  async (t, interceptor, endpoint, next, result, params) => {
    t.deepEqual(result, {
      base: "ou=groups,dc=example,dc=de",
      scope: "sub",
      attributes: ["cn"],
      filter:
        "(&(objectclass=groupOfUniqueNames)(uniqueMember=uid=hugo,ou=accounts,dc=example,dc=de))"
    });
  }
);
