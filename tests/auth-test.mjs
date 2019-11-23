import test from "ava";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import { ServiceLDAP } from "../src/service-ldap.mjs";


const config = {
  url: "ldap://localhost:3389",
  bindDN: "uid={{username}},ou=accounts,dc=example,dc=com",
  entitlements: {
    base: "ou=groups,dc=example,dc=com",
    attribute: "cn",
    scope: "sub",
    filter:
      "(&(objectclass=groupOfUniqueNames)(uniqueMember=uid={{username}},ou=accounts,dc=example,dc=com))"
  }
};

test("service-ldap auth ok", async t => {
  const sp = new StandaloneServiceProvider();
  const ldap = new ServiceLDAP(
    config,
    sp
  );

  await ldap.start();

  t.is(ldap.state, "running");

  t.deepEqual(await ldap.authenticate({ username: 'user1', password: 'test' }), { username: 'user1', entitlements: new Set(['konsum']) });
});

test("service-ldap auth invalid", async t => {
  const sp = new StandaloneServiceProvider();
  const ldap = new ServiceLDAP(
    config,
    sp
  );

  await ldap.start();

  t.is(ldap.state, "running");

  await t.throwsAsync(async () => ldap.authenticate({ username: 'user1', password: 'invalid' }), 'Invalid credentials during a bind operation. Code: 0x31');
});

test("service-ldap wrong url", async t => {
  const sp = new StandaloneServiceProvider();

  const ldap = new ServiceLDAP(
    {
      ...config,
      url: "ldap://localhost:3388"
    },
    sp
  );

  await ldap.start();

  t.is(ldap.state, "running");

  await t.throwsAsync(async () => ldap.authenticate({ username: 'user1', password: 'test' }), Error);
});