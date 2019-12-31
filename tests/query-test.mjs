import test from "ava";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import { ServiceLDAP } from "../src/service-ldap.mjs";

const config = {
  type: ServiceLDAP,
  url: "ldap://localhost:3389",
  bindDN: "ou=accounts,dc=example,dc=com"
};

test("service-ldap search", async t => {
  const sp = new StandaloneServiceProvider();
  const ldap = await sp.declareService(config);
  await ldap.start();
  t.is(ldap.state, "running");

  t.deepEqual(
    (
      await ldap.search({
        bindDN: "uid=user1,ou=accounts,dc=example,dc=com",
        password: "test",
        base: "ou=groups,dc=example,dc=com",
        scope: "sub",
        attributes: ["cn"],
        filter: "(objectclass=groupOfUniqueNames)"
      })
    ).searchEntries,
    [{ cn: "konsum", dn: "cn=konsum,ou=groups,dc=example,dc=com" }]
  );
});
