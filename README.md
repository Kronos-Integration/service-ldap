[![npm](https://img.shields.io/npm/v/@kronos-integration/service-ldap.svg)](https://www.npmjs.com/package/@kronos-integration/service-ldap)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/@kronos-integration/service-ldap)](https://bundlephobia.com/result?p=@kronos-integration/service-ldap)
[![downloads](http://img.shields.io/npm/dm/@kronos-integration/service-ldap.svg?style=flat-square)](https://npmjs.org/package/@kronos-integration/service-ldap)
[![GitHub Issues](https://img.shields.io/github/issues/Kronos-Integration/service-ldap.svg?style=flat-square)](https://github.com/Kronos-Integration/service-ldap/issues)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2FKronos-Integration%2Fservice-ldap%2Fbadge&style=flat)](https://actions-badge.atrox.dev/Kronos-Integration/service-ldap/goto)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/Kronos-Integration/service-ldap/badge.svg)](https://snyk.io/test/github/Kronos-Integration/service-ldap)
[![Coverage Status](https://coveralls.io/repos/Kronos-Integration/service-ldap/badge.svg)](https://coveralls.io/github/Kronos-Integration/service-ldap)

# @kronos-integration/service-ldap

ldap

# usage

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [ServiceLDAP](#serviceldap)
    -   [search](#search)
        -   [Parameters](#parameters)
    -   [authenticate](#authenticate)
        -   [Parameters](#parameters-1)
    -   [name](#name)

## ServiceLDAP

**Extends Service**

LDAP

### search

Execute a query.

#### Parameters

-   `request` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** result

### authenticate

Authorize with username and password.

#### Parameters

-   `props` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `props.username` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `props.password` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **[Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** entitlements

### name

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 'ldap'

# install

With [npm](http://npmjs.org) do:

```shell
npm install @kronos-integration/service-ldap
```

# license

BSD-2-Clause
