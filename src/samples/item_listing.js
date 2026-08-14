// Sample code to create a listing for Rocket League.
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

// Create a Rocket League listing
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
    
    // For an inventory of Rocket League items and photo URLs, view https://gameflip.com/api/gameitem/inventory/812872018935
    // and for Fortnite, view https://gameflip.com/api/gameitem/inventory/GFFORTNITE
    
    // DO EDIT: Choose an image for your listing, which could be a URL or file path
    let photo_url = 'https://gameflip.com' + '/img/items/generic/icon_ingame_pet.png';
    let photo_file = 'icon_ingame_pet.png';
    // Create an initial listing
    let query = {
      
        // DO EDIT: Put just 'Key' for example if you are selling one, otherwise write the quantity as so: Item Name | 10x
        name: 'Pet',
        description: 'Pet Dragon',
        price: 1050, // price in cents
        tags: [      // Must use the correct tag for search/filtering to function properly
          "id: pet",
          "type: Pet",
          "roblox_game: Adopt Me"
        ],

        // MAYBE EDIT: Platform variation, change if you want to sell for example Fortnite (upc) on the PlayStation (platform) section instead
        upc: "4ca1b5e8-00e1-4625-bbfd-9897a154e294",   // Optional, specify the game product ID from Gameflip product catalog
        platform: "roblox",
        shipping_within_days: GfApi.SHIPPING_WITHIN_DAYS.ONE,
        expire_in_days: GfApi.EXPIRE_IN_DAYS.SEVEN,
        //accept_currency: GfApi.ACCEPT_CURRENCY.FLP   // Uncomment this if you want to accept FLP instead of USD

        // DON'T EDIT: Standard settings for coordinated transfer in game item
        category: GfApi.CATEGORY.INGAME,
        kind: GfApi.KIND.ITEM,
        digital: true,
        digital_region: 'none',
        digital_deliverable: 'transfer',
        shipping_predefined_package: 'None',
        shipping_fee: 0,
        shipping_paid_by: 'seller',
        visibility: GfApi.VISIBILITY.PUBLIC,

        // NOTE: Special treatment for listings with quantity (even if you only have one item to sell):
        // - Only available for game items category and "coordinated transfer" type of digital delivery
        // - Buyer can save listing to favorite 
        // - Buyer can buy multiple items in one order
        // - Generally better visibility in search results
        // - You can restock or increase quantity any time later
        qty_avail: 5,
    };
    let listing = await gfapi.listing_post(query);

    // Upload an image to show in the listing page
    let cover_photo = null;
    listing = await gfapi.upload_photo(listing.id, photo_url, 1);

    // Find the photo ID and make it the cover (thumbnamil)
    if (listing.photo) {
      for (const [id, photo] of Object.entries(listing.photo)) {
        if (!photo && photo.status === 'active') {
          photo = photo;
          break;
        }
      }
    }
    // If you want to add a second image in the listing page then uncomment the two lines below:
    //return gfapi.upload_photo(listing.id, photo_url, 1);
    if (cover_photo) {
      console.log(photo, "Patch cover photo....");
      let patch = [{
        op: GfApi.LISTING_OPS.REPLACE,
        path: '/cover_photo',
        value: photo.id
      }];
      gfapi.listing_patch(listing.id, patch).then((l) => {
        console.log('Updated listing with cover photo', l);
      }).then(() => {
          // IMPORTANT: Once the listing is set "onsale", it will be restricted for editing (e.g. only price and quantity can be changed).
          // List the listing for sale.
          // return gfapi.listing_status(listing.id, GfApi.LISTING_STATUS.ONSALE);
      });
    }
}

// Run main() and catch any unhandle Promise errors
main().catch(err => {
    console.log('==== ERROR', err);
});
