import test from "ava";
import { SendEndpoint } from "@kronos-integration/endpoint";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import {
  ServiceLDAP,
  LDAPQueryInterceptor
} from "@kronos-integration/service-ldap";

test("defaults", async t => {
  const interceptor = new LDAPQueryInterceptor();
  t.deepEqual(interceptor.query, {});
});

test("query params", async t => {
  const sp = new StandaloneServiceProvider();
  const http = await sp.declareService({
    type: ServiceLDAP
  });
  const endpoint = new SendEndpoint("e", http);

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
