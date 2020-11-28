import test from "ava";
import {
  interceptorTest,
  dummyEndpoint
} from "@kronos-integration/test-interceptor";

import { SendEndpoint } from "@kronos-integration/endpoint";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import {
  ServiceLDAP,
  LDAPQueryInterceptor
} from "@kronos-integration/service-ldap";


test(
  interceptorTest,
  LDAPQueryInterceptor,
  undefined,
  { json: { query: {} } },
  dummyEndpoint("e1"),
  [],
  () => 77,
  async (t, interceptor, endpoint, next, result) => {
    t.is(result, 77);
  }
);

test(
  interceptorTest,
  LDAPQueryInterceptor,
  { query: {} },
  { json: { query: { }} },
  dummyEndpoint("e1"),
  [{ user : "hugo"}],
  () => 77,
  async (t, interceptor, endpoint, next, result, params) => {
    t.is(result, 77);
  }
);

test("query params", async t => {
  const sp = new StandaloneServiceProvider();
  const ldap = await sp.declareService({
    type: ServiceLDAP
  });
  const endpoint = new SendEndpoint("e", ldap);

  const configureadQuery = {};

  const interceptor = new LDAPQueryInterceptor({ query: configureadQuery });

  t.deepEqual(interceptor.query, configureadQuery);

  const params = { a: "A" };

  await interceptor.receive(
    endpoint,
    params => {
      //  console.log(params);
    },
    params
  );
});
