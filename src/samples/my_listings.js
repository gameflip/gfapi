// Sample code to search for a user's listings. 
// Your Gameflip account needs to be verified and in good standing.
//
// Generate the API Key and OTP secret in [Settings page](https://gameflip.com/settings)
//
// Type in bash shell:
// ```
//   export GFAPI_KEY=my_api_key
//   export GFAPI_SECRET=my_api_secret
//   node src/samples/bulk_listing.js
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

    // Put in an owner ID as seen in the URL of a user's Gameflip profile.
    // For example: let owner = 'us-east-1:c62554cb-d881-4ac4-a0ab-7b51022ab87c';
    let owner = '';
    let profile = await gfapi.profile_get(owner);
    console.log(`==== User's Profile:`);
    console.log(profile);
    owner = profile ? profile.owner : owner;
    if (owner) {
      let data = await gfapi.listing_of(owner);
      console.log(`==== User's Listings:`);
      console.log(data.listings);
    }
}

// Run main() and catch any unhandled Promise errors
main().catch(err => {
    console.log('==== ERROR', err);
});
