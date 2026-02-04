#!/bin/bash

PORT=3389
URI=ldap://localhost:${PORT}
SECRET=test
SECRET_HASH=$(slappasswd -s $SECRET)
DATABASE_DIR=/tmp/slapd/data

mkdir -p ${DATABASE_DIR}

case $(uname) in
    "Darwin" )
        export PATH="/opt/homebrew/opt/openldap/bin:/opt/homebrew/opt/openldap/sbin:$PATH"
        SLAPD=/opt/homebrew/opt/openldap/libexec/slapd
        SLAPD_CONF=/tmp/slapd/slapd.conf
        sed 's/\/etc\/ldap\//\/opt\/homebrew\/Cellar\/openldap\/2.6.12\/.bottle\/etc\/openldap\//' tests/fixtures/ldap/slapd.conf > ${SLAPD_CONF}
    ;;
    
    "*" )
        SLAPD=slapd
        SLAPD_CONF=tests/fixtures/ldap/slapd.conf
    ;;
esac

sed -isave "s/rootpw.*/rootpw ${SECRET_HASH}/" $SLAPD_CONF
#sed -isave "s/database.*/database ${DATABASE_DIR}/" $SLAPD_CONF

slapadd -n 1 -f ${SLAPD_CONF} -l tests/fixtures/ldap/base.ldif
${SLAPD} -f ${SLAPD_CONF} -h ${URI} -d 1 &
sleep 2

ldapsearch -H ${URI} -w ${SECRET} -D cn=Manager,dc=example,dc=com -b dc=example,dc=com
 