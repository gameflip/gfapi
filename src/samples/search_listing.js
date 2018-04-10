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

    // Search listings for Rocket League XBox One
    let query = {
      category: GfApi.CATEGORY.INGAME,
      upc: '812872018935',                  // Rocket League on Xbox One
      status: GfApi.LISTING_STATUS.ONSALE,  // On sale listings only (not Sold)
      price: '100,2999',                    // Price range between 1 USD and 29.99 USD (value in cents)
      tags: 'id: zomba',                    // Search only Zomba wheels
      sort: 'price:asc',                    // Sort by lowest price (highest price: 'price:desc', most recent: 'onsale:desc')
      limit: 5
    };

    let listings = await gfapi.listing_search(query);
    listings.map(listing => {
      console.log("=== Listing " + listing.id, JSON.stringify(listing, null, 2));
    });

    // Search listings for CSGO skins
    query = {
      category: GfApi.CATEGORY.INGAME,
      upc: '094922417596',                  // CSGO
      status: GfApi.LISTING_STATUS.ONSALE,  // On sale listings only (not Sold)
      tags: 'Type: Rifle^Weapon: AK-47',    // Filter by Rifle and AK-47
      sort: 'onsale:desc',
      limit: 5
    };

    listings = await gfapi.listing_search(query);
    listings.map(listing => {
      console.log("=== Listing " + listing.id, JSON.stringify(listing, null, 2));
    });
}

// Run main() and catch any unhandle Promise errors
main().catch(err => {
    console.log('==== ERROR', err);
});
