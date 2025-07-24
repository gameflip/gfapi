// Sample code to create a listing for Fortnite.
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

// Create a Fortnite listing
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
    
    // For an inventory of Fortnite items and photo URLs, view https://gameflip.com/api/gameitem/inventory/GFFORTNITE
    
    // DO EDIT: Choose an image for your listing, which could be a URL or file path
    let photo_url = 'https://gameflip.com' + '/img/items/generic/icon_ingame_crafting.png';
    // Create an initial listing
    let query = {
      
        // DO EDIT: Put just 'Key' for example if you are selling one, otherwise write the quantity as so: Item Name | 10x
        name: 'Keys | 10x',
        description: 'Selling cheap keys!',
        price: 1050, // price in cents
        tags: [      // Must use the correct tag for search/filtering to function properly
          "id: key",
          "type: Key",
          "quantity: 10x"
        ],
        // Example with color
        // tags: [ "id: chakram", "type: Wheel", "color: Black" ]

        // MAYBE EDIT: Platform variation, change if you want to sell for example Fortnite (upc) on the PlayStation (platform) section instead
        upc: GfApi.UPC.FORTNITE,
        platform: GfApi.PLATFORM.XONE,
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
        
    };
    let listing = await gfapi.listing_post(query);
    
    // Upload an image to show in the listing page
    gfapi.upload_photo(listing.id, photo_url, 0).then(() => {
      // Upload another image to show in the search results
      return gfapi.upload_photo(listing.id, photo_url);
      // If you want to add a second image in the listing page then uncomment the two lines below:
      // }).then(() => {
      // return gfapi.upload_photo(listing.id, second_photo_url, 1);
    }).then(() => {
      // List the listing for sale
      return gfapi.listing_status(listing.id, GfApi.LISTING_STATUS.ONSALE);
    }).catch(err => {
      console.log(err);
    });
}

// Run main() and catch any unhandle Promise errors
main().catch(err => {
    console.log('==== ERROR', err);
});
