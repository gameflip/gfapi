// Sample code to search listings on Gameflip.  Your Gameflip account needs to be verified and in good standing.
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

// Search exchanges (sold listings or purchases)
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

    // Search sold & completed listing
    let query = {
      role: 'seller',   // Get my 'complete' exchanges (rated by both buyer & seller).  Use role: 'buyer' for listings you bought.
      status: GfApi.EXCHANGE_STATUS.COMPLETE,
      limit: 5
    };

    let result = await gfapi.exchange_search(query);
    console.log("Found " + result.found + " results");
    let exchanges = result.exchanges || [];
    exchanges.map(exchange => {
      //console.log("=== Exchange " + exchange.id, JSON.stringify(exchange, null, 2));
      console.log("=== Exchange " + exchange.name);
    });

    // Search past completed purchases
    query = {
      role: 'buyer',
      status: GfApi.EXCHANGE_STATUS.COMPLETE,
      limit: 5
    };

    result = await gfapi.exchange_search(query);
    console.log("Found " + result.found + " results");
    exchanges = result.exchanges || [];
    exchanges.map(exchange => {
      //console.log("=== Exchange " + exchange.id, JSON.stringify(exchange, null, 2));
      console.log("=== Exchange " + exchange.name);
    });

}

// Run main() and catch any unhandle Promise errors
main().catch(err => {
    console.log('==== ERROR', err);
});
