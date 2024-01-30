// Sample code to search for a user's listings.
// Your Gameflip account needs to be verified and in good standing.
//
// Generate the API Key and OTP secret in [Settings page](https://gameflip.com/settings)
//
// Type in bash shell:
// ```
//   export GFAPI_KEY=my_api_key
//   export GFAPI_SECRET=my_api_secret
//   node src/samples/my_wallet.js
// ```
//
// If you are using an IDE, set the `GFAPI_KEY` and `GFAPI_SECRET` in the Run Configuration Environment.
// Be careful not to commit/push anything with the API key/secret to a public repository.

'use strict';

const GFAPI_KEY = process.env.GFAPI_KEY;
const GFAPI_SECRET = process.env.GFAPI_SECRET;

// For your own code, use the 'gfapi' library (`npm install 'iJJi/gfapi').
const GfApi = require('../../index'); // require('gfapi')

async function main() {
    // Create GF API client. Options: logLevel
    // * `trace` (logs HTTP requests/responses)
    // * `debug` (outputs HTTP requests)
    const gfapi = new GfApi(GFAPI_KEY, {
        secret: GFAPI_SECRET,
        algorithm: "SHA1",
        digits: 6,
        period: 30
    }, {
        logLevel: 'debug'
    });

    // Get my own profile
    let profile = await gfapi.profile_get();
    console.log(`==== My Profile:`);
    console.log(profile);

    // Get my current wallet balance
    let wallet = await gfapi.wallet_get(profile.owner);
    console.log(`==== My Wallet:`);
    console.log(wallet);

    // Get the current wallet balance with ledger entries for 2018-08
    wallet = await gfapi.wallet_get(profile.owner, {year_month: '2018-08'});
    console.log(`==== My Wallet for Aug 2018:`);
    console.log(wallet);

}

// Run main() and catch any unhandled Promise errors
main().catch(err => {
    console.log('==== ERROR', err);
});
