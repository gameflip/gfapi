#!/usr/bin/env node

// **Generates authorization header to login to Gameflip API**
//
// 1. Get your Gameflip API Key and TOTP secret:
// ```
// https://gameflip.com/settings
// ```
//
// 2. Add the API key and secret to your IDE environment or `~/.bash_profile`:
// ```bash
// export GFAPI_KEY=my_api_key
// export GFAPI_SECRET=my_api_secret
// ```
//
// 3. Sample API call to get your profile
// ```bash
// export API="https://production-gameflip.fingershock.com/api/v1"
// curl -isS -H "$(node authorization.js)" -X GET "${API}/account/me/profile"; echo
// ```

'use strict';

const GFAPI_KEY = process.env.GFAPI_KEY;
const GFAPI_SECRET = process.env.GFAPI_SECRET;

const Speakeasy = require('speakeasy');

const secret = {
    secret: GFAPI_SECRET,
    encoding: 'base32',
    algorithm: 'sha1'
};

console.log(`Authorization: GFAPI ${GFAPI_KEY}:${Speakeasy.totp(secret)}`);
