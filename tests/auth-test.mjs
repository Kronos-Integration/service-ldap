import test from "ava";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import { ServiceLDAP } from "../src/service-ldap.mjs";

test("service-ldap auth ok", async t => {
  const sp = new StandaloneServiceProvider();

  const ldap = new ServiceLDAP(
    {
      url: "ldap://localhost:3389",
      bindDN: "uid={{username}},ou=accounts,dc=example,dc=com",
      entitlements: {
        base: "ou=groups,dc=example,dc=com",
        attribute: "cn",
        scope: "sub",
        filter:
          "(&(objectclass=groupOfUniqueNames)(uniqueMember=uid={{username}},ou=accounts,dc=example,dc=com))"
      }
    },
    sp
  );

  await ldap.start();

  t.is(ldap.state, "running");

  t.deepEqual(await ldap.authenticate({ username: 'user1', password: 'test' }), { username: 'user1', entitlements: new Set(['konsum']) });
});


test("service-ldap no bind", async t => {
  const sp = new StandaloneServiceProvider();

  const ldap = new ServiceLDAP(
    {
      url: "ldap://localhost:3388",
      bindDN: "uid={{username}},ou=accounts,dc=example,dc=com",
      entitlements: {
        base: "ou=groups,dc=example,dc=com",
        attribute: "cn",
        scope: "sub",
        filter:
          "(&(objectclass=groupOfUniqueNames)(uniqueMember=uid={{username}},ou=accounts,dc=example,dc=com))"
      }
    },
    sp
  );

  await ldap.start();

  t.is(ldap.state, "running");

  t.deepEqual(await ldap.authenticate({ username: 'user1', password: 'test' }), { username: 'user1', entitlements: new Set(['konsum']) });
});