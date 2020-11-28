import test from "ava";
import {
  interceptorTest,
  dummyEndpoint
} from "@kronos-integration/test-interceptor";

import { LDAPQueryInterceptor } from "@kronos-integration/service-ldap";

test(
  interceptorTest,
  LDAPQueryInterceptor,
  undefined,
  { json: { type: "ldap-query", query: {} } },
  dummyEndpoint("e1"),
  [],
  query => 77,
  async (t, interceptor, endpoint, next, result, params) => {
    t.is(result, 77);
  }
);

test(
  interceptorTest,
  LDAPQueryInterceptor,
  {
    query: {
      base: "ou=groups,dc=example,dc=de",
      scope: "sub",
      attributes: ["cn"],
      filter:
        "(&(objectclass=groupOfUniqueNames)(uniqueMember=uid={{user}},ou=accounts,dc=example,dc=de))"
    }
  },
  {
    json: {
      type: "ldap-query",
      query: {
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
