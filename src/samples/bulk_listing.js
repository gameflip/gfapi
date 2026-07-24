// Sample code to creates listings for first 2 items in your Steam CS2 inventory.
// Your Gameflip account needs to be verified and Steam connected.
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

// Create listings for first 2 items in your Steam CS2 inventory
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

    // Checks if you are Steam connected and do not have a trade ban or hold. Can be commented out after first run.
    await gfapi.check_trade_ban(); // throws UnprocessableEntityError if trade ban or hold

    // Get your Gameflip profile for your profile.steam_id
    const profile = await gfapi.profile_get();

    // Get Steam inventory (must be public).
    // Note: this is a helper function and is not really part of the API (ie, not supported).
    let inventory = await gfapi.steam_inventory_get(profile.steam_id, GfApi.STEAM.APP_ID.CS2, {
        l: 'english', count: 2
    });

    // Item's `market_hash_name` needed if you are specifying price
    const marketHashName = inventory.descriptions.reduce((map, x) => {
        map[x.classid] = x.market_hash_name;
        return map;
    }, {});

    // Create bulk object (bulk.status='start')
    let bulk = await gfapi.bulk_post();

    const bulk_id = bulk.id;
    console.log("=== BULK_ID =", bulk_id);

    // Initiate trade offer (bulk.status='receive_pending')
    bulk = await gfapi.bulk_put(bulk_id, {
        items: inventory.assets.map(x => ({
            id: x.assetid,  // id of item
            appid: x.appid, // Currently, all items must have same appid
            price: 100,     // Optional. price in cents
            market_hash_name: marketHashName[x.classid] // Optional. Used to identify item for price
        }))
    });

    console.log(`== Created trade offer ${bulk.offer_key}`);

    // You must now go into the Steam Mobile Client and accept and confirm trade offer.
    // This will poll until you accept/confirm, reject, or the trade offer times out.
    // When Gameflip detects that it has received the Steam items (and there are no trade holds),
    // the Gameflip server will create a listing for each item.
    let attempt = 1;
    do {
        console.log(`== ${attempt++} Waiting for you to ACCEPT and CONFIRM OFFER`);

        await GfApi.sleep(10);

        // With no data parameter specified, the `bulk_put` updates and returns latest bulk object
        bulk = await gfapi.bulk_put(bulk_id);
    } while (bulk.status == GfApi.ESCROW_STATUS.RECEIVE_PENDING);

    // See bulk.listings for the listing id and status.
    console.log("=== BULK =", JSON.stringify(bulk, null, 2));

    // When `bulk.status = 'listed'`, all listings will be created but may still be pending search indexing.
    // You can do a `gfapi.listing_get(listing_id)` to verify their existance.
    attempt = 1;
    do {
        console.log(`== ${attempt++} Pending listing creation`);
        await GfApi.sleep(10);

        // With no data parameter specified, the `bulk_put` updates and returns latest bulk object
        bulk = await gfapi.bulk_put(bulk_id);
    } while (bulk.status == GfApi.ESCROW_STATUS.RECEIVED);

    // If `price` and `market_hash_name` are specified and there is no ambiguity about the item, the listings
    // will have the status specified. Otherwise, the listing status will be 'draft'.
    // Display first listing
    let listing_id = bulk.listings[0].id;
    let listing = await gfapi.listing_get(listing_id);
    console.log("=== First listing =", JSON.stringify(listing, null, 2));

    let escrow = await gfapi.escrow_get(listing_id);
    console.log("=== First escrow =", JSON.stringify(escrow, null, 2));
}

// Run main() and catch any unhandle Promise errors
main().catch(err => {
    console.log('==== ERROR', err);
});
