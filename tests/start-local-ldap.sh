#!/bin/bash

mkdir -p /tmp/slapd

case $(uname) in
    "Darwin" )
        export PATH="/usr/local/opt/openldap/bin:/usr/local/opt/openldap/sbin:$PATH"
        SLAPD=/usr/local/opt/openldap/libexec/slapd
        SLAPD_CONF=/tmp/slapd/slapd.conf
        sed 's/\/etc\/ldap\//\/usr\/local\/etc\/openldap\//' tests/fixtures/ldap/slapd.conf > ${SLAPD_CONF}
    ;;
    
    "*" )
        SLAPD=slapd
        SLAPD_CONF=tests/fixtures/ldap/slapd.conf
    ;;
esac


${SLAPD} -f ${SLAPD_CONF} -h ldap://localhost:3389 -d 1 &
ldapadd -h localhost:3389 -D cn=Manager,dc=example,dc=com -w test -f tests/fixtures/ldap/base.ldif
