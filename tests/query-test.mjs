import test from "ava";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import { ServiceLDAP } from "@kronos-integration/service-ldap";

const PORT = process.env.PORT || 389;

const config = {
  type: ServiceLDAP,
  url: `ldap://localhost:${PORT}`
};

test.serial("service-ldap search with bind", async t => {
  const sp = new StandaloneServiceProvider();
  const ldap = await sp.declareService(config);
  await ldap.start();
  t.is(ldap.state, "running");

  t.deepEqual(
    await ldap.search({
      bind: { dn: "uid=user1,ou=accounts,dc=example,dc=com", password: "test" },
      base: "ou=groups,dc=example,dc=com",
      scope: "sub",
      attributes: ["cn"],
      filter: "(objectclass=groupOfUniqueNames)"
    }),
    [
      { cn: "konsum", dn: "cn=konsum,ou=groups,dc=example,dc=com" },
      { cn: "service1", dn: "cn=service1,ou=groups,dc=example,dc=com" },
      { cn: "service2", dn: "cn=service2,ou=groups,dc=example,dc=com" }
    ]
  );
});

test.serial("service-ldap search without bind", async t => {
  const sp = new StandaloneServiceProvider();
  const ldap = await sp.declareService(config);
  await ldap.start();
  t.is(ldap.state, "running");

  t.deepEqual(
    await ldap.search({
      base: "ou=groups,dc=example,dc=com",
      scope: "sub",
      attributes: ["cn"],
      filter: "(objectclass=groupOfUniqueNames)"
    }),
    [
      { cn: "konsum", dn: "cn=konsum,ou=groups,dc=example,dc=com" },
      { cn: "service1", dn: "cn=service1,ou=groups,dc=example,dc=com" },
      { cn: "service2", dn: "cn=service2,ou=groups,dc=example,dc=com" }
    ]
  );
});

test.serial("service-ldap add / delete", async t => {
  const sp = new StandaloneServiceProvider();
  const ldap = await sp.declareService(config);
  await ldap.start();
  t.is(ldap.state, "running");

  const dn = "cn=service3,ou=groups,dc=example,dc=com";
  const bind = {
    dn: "uid=user1,ou=accounts,dc=example,dc=com",
    password: "test"
  };

  try {
    await ldap.del({
      bind,
      dn
    });
  }
  catch {}

  t.is(
    await ldap.add({
      bind,
      dn,
      entry: {
        cn: "service3",
        objectclass: "groupOfUniqueNames",
        uniqueMember: "uid=user1,ou=accounts,dc=example,dc=com"
      }
    }),
    undefined
  );

  /*t.is(
    await ldap.modify({
      bind,
      dn,
      replace : {
        uniqueMember: "uid=user2,ou=accounts,dc=example,dc=com"
      }
    }),
    undefined
  );*/

  t.is(
    await ldap.del({
      bind,
      dn
    }),
    undefined
  );
});
