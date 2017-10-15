# React-Simple-Auth

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Greenkeeper badge](https://badges.greenkeeper.io/alexjoverm/typescript-library-starter.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/alexjoverm/typescript-library-starter.svg)](https://travis-ci.org/alexjoverm/typescript-library-starter)
[![Coveralls](https://img.shields.io/coveralls/alexjoverm/typescript-library-starter.svg)](https://coveralls.io/github/alexjoverm/typescript-library-starter)
[![Dev Dependencies](https://david-dm.org/alexjoverm/typescript-library-starter/dev-status.svg)](https://david-dm.org/alexjoverm/typescript-library-starter?type=dev)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/AJoverMorales)

# Simple Authentication for React

## Resources

- Detailed Walkthrough: \
https://medium.com/p/de6ea9df0a63

- Video demonstration: \
https://www.youtube.com/watch?v=BEUrlvHY8eE

- Sample Application using react-simple-auth: \
https://github.com/mattmazzola/react-simple-auth-sample

Technical Docs: \
https://mattmazzola.github.io/react-simple-auth/

# Getting started

## Installation
```bash
npm i react-simple-auth
```
## Copy [redirect.html](https://github.com/mattmazzola/react-simple-auth/blob/master/static/redirect.html)
Copy file from `/node_modules/react-simple-auth/dist/redirect.html` into folder that will service static files. E.g. If you are using create-react-app this will be the `public` folder.  Ensure your OAuth provider is configured to redirect to this html page instead of your normal application / index page.

## Create a provider
You would have to look at each OAuth provider's developer documentation for details.

Create a javascript object implementing the `IProvider` interface.

See the sample for Microsoft AAD v2 OpenID-Connect from the sample project: \
https://github.com/mattmazzola/react-simple-auth-sample/blob/master/src/providers/microsoft.ts

Based on these docs: \
https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols

## Call the various methods from the auth service

Import:
```typescript
import RSA from 'react-simple-auth'
import facebookProvider from './providers/facebook'
```

Somewhere inside the component:
```typescript
// Open login window and wait for user to sign in
const session = await RSA.acquireTokenAsync(facebookProvider)

// Invoke Redux login action dispatcher
login(session.userId, session.userName)
```

