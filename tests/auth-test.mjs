import test from "ava";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import { ServiceLDAP } from "@kronos-integration/service-ldap";

const PORT=process.env.PORT | 3389;

const config = {
  type: ServiceLDAP,
  url: `ldap://localhost:${PORT}`,
  entitlements: {
    bindDN: "uid={{username}},ou=accounts,dc=example,dc=com",
    base: "ou=groups,dc=example,dc=com",
    attribute: "cn",
    scope: "sub",
    filter:
      "(&(objectclass=groupOfUniqueNames)(uniqueMember=uid={{username}},ou=accounts,dc=example,dc=com))"
  }
};

test("service-ldap auth ok", async t => {
  const sp = new StandaloneServiceProvider();
  const ldap = await sp.declareService(config);

  t.deepEqual(
    await ldap.authenticate({ username: "user1", password: "test" }),
    { username: "user1", entitlements: new Set(["konsum","service1","service2"]) }
  );
});

test("service-ldap over endpoint", async t => {
  const sp = new StandaloneServiceProvider();
  const ldap = await sp.declareService(config);

  t.deepEqual(
    await ldap.endpoints.authenticate.receive({
      username: "user1",
      password: "test"
    }),
    { username: "user1", entitlements: new Set(["konsum","service1","service2"]) }
  );
});

test("service-ldap auth invalid", async t => {
  const sp = new StandaloneServiceProvider();
  const ldap = await sp.declareService(config);

  await t.throwsAsync(
    async () => ldap.authenticate({ username: "user1", password: "invalid" }),
  //  "Invalid credentials during a bind operation. Code: 0x31"
  );
});

test("service-ldap wrong url", async t => {
  const sp = new StandaloneServiceProvider();
  const ldap = await sp.declareService({
    ...config,
    url: "ldap://localhost:3388"
  });

  await t.throwsAsync(
    async () => ldap.authenticate({ username: "user1", password: "test" }),
  //  Error
  );
});
