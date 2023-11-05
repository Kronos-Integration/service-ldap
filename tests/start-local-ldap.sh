#!/bin/bash

PORT=3389
SECRET=test

mkdir -p /tmp/slapd

case $(uname) in
    "Darwin" )
    /opt/homebrew/opt/openldap/bin
        export PATH="/opt/homebrew/opt/openldap/bin:/opt/homebrew/opt/openldap/sbin:$PATH"
        SLAPD=/opt/homebrew/opt/openldap/libexec/slapd
        SLAPD_CONF=/tmp/slapd/slapd.conf
        sed 's/\/etc\/ldap\//\/usr\/local\/etc\/openldap\//' tests/fixtures/ldap/slapd.conf > ${SLAPD_CONF}
    ;;
    
    "*" )
        SLAPD=slapd
        SLAPD_CONF=tests/fixtures/ldap/slapd.conf
    ;;
esac

${SLAPD} -f ${SLAPD_CONF} -h ldap://localhost:${PORT} -d 1 &
ldapadd -h localhost:${PORT} -D cn=Manager,dc=example,dc=com -w ${SECRET} -f tests/fixtures/ldap/base.ldif
 