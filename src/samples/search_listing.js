// Sample code to search listings on Gameflip.
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

    // Search the product catalog.
    // You may use the product's "sku" as your game item listing's "upc".
    let query = {
        name: "Fallout",
        category: GfApi.CATEGORY.GAMES
    };

    let data = await gfapi.product_search(query);
    if (data && data.products) {
        data.products.forEach(product => {
            console.log("=== Product " + product.sku, JSON.stringify(product, null, 2));
        });
    }

    // Search listings for Fallout 76 PC.
    // The "listing_search" function automatically includes the required property "v2: true" for searching listings.
    query = {
        category: GfApi.CATEGORY.INGAME,
        upc: GfApi.UPC.FALLOUT76_PC,          // Fallout 76 on PC
        status: GfApi.LISTING_STATUS.ONSALE,  // On sale listings only (not Sold)
        price: '100,2999',                    // Price range between 1 USD and 29.99 USD (value in cents)
        tags: 'mode: Adventure',              // Search by game mode
        sort: 'price:asc',                    // Sort by lowest price (highest price: 'price:desc', most recent: 'onsale:desc')
        limit: 5                              // Number of results
    };

    data = await gfapi.listing_search(query);
    if (data && data.listings) {
        data.listings.forEach(listing => {
            console.log("=== Listing " + listing.id, JSON.stringify(listing, null, 2));
        });
    }

    // Search listings for CS2 skins
    query = {
        category: GfApi.CATEGORY.INGAME,
        upc: GfApi.UPC.CS2,                   // CS2
        status: GfApi.LISTING_STATUS.ONSALE,  // On sale listings only (not Sold)
        tags: 'Type: Rifle^Weapon: AK-47',    // Filter by Rifle and AK-47
        sort: 'onsale:desc',
        limit: 5
    };

    data = await gfapi.listing_search(query);
    if (data && data.listings) {
        data.listings.forEach(listing => {
            console.log("=== Listing " + listing.id, JSON.stringify(listing, null, 2));
        });
    }

    // Search listings for gift cards from sellers who accept FLP
    query = {
        category: GfApi.CATEGORY.GIFTCARD,
        status: GfApi.LISTING_STATUS.ONSALE,           // On sale listings only (not Sold)
        accept_currency: GfApi.ACCEPT_CURRENCY.FLP,    // Accept FLP only
        sort: 'onsale:desc',
        limit: 5
    };

    data = await gfapi.listing_search(query);
    if (data && data.listings) {
        data.listings.forEach(listing => {
            console.log("=== Listing accepting FLP only " + listing.id, JSON.stringify(listing, null, 2));
        });
    }

    // Search listings for Google Play gift cards
    query = {
        category: GfApi.CATEGORY.GIFTCARD,
        platform: 'google',                   // Other brands you can search 'apple', 'amazon', 'xbox_live', 'playstation_network', 'steam', and more
        status: GfApi.LISTING_STATUS.ONSALE,  // On sale listings only (not Sold)
        sort: 'onsale:desc',
        limit: 5
    };

    data = await gfapi.listing_search(query);
    if (data && data.listings) {
        data.listings.forEach(listing => {
            console.log("=== Listing for Google Play gift card " + listing.id, JSON.stringify(listing, null, 2));
        });
    }
}

// Run main() and catch any unhandled Promise errors
main().catch(err => {
    console.log('==== ERROR', err);
});
