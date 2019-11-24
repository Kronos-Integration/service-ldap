
slapd -f tests/fixtures/ldap/slapd.conf -h ldap://localhost:3389 &
ldapadd -h localhost:3389 -D cn=Manager,dc=example,dc=com -w test -f tests/fixtures/ldap/base.ldif
