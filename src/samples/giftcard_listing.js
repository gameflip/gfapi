// Sample code to create a listing for gift cards.
// Your Gameflip account needs to be verified and Steam connected.
//
// Generate the API Key and OTP secret in [Settings page](https://gameflip.com/settings)
//
// Type in bash shell:
// ```
//   export GFAPI_KEY=my_api_key
//   export GFAPI_SECRET=my_api_secret
//   node src/samples/giftcard_listing.js
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
    
    // DO EDIT: Choose an image for your listing, which could be a URL or file path
    let photo_url = 'https://gameflip.com/img/app/digital_card_googleplay.png';
    // Create an initial listing
    let query = {
      
        // DO EDIT: Use appropriate name & description to reflect the nature of the listing
        name: '$20.00 Google Play',               // Include the full value with $ so that discount can be shown
        description: '$20.00 Google Play card',   // Include any specific instructions or important information in description
        price: 1950, // price you want to sell in cents
        tags: [      // Must use the correct tags for search/filtering to function properly
          "balance: 2000",
          "currency: USD",
          "type: giftcard"
        ],

        // Standard settings
        platform: "google",
        expire_in_days: GfApi.EXPIRE_IN_DAYS.SEVEN,
        category: GfApi.CATEGORY.GIFTCARD,
        kind: GfApi.KIND.ITEM,
        digital: true,
        digital_region: 'none',                                 // If restrictive, must specify (ex: "US")
        digital_deliverable: 'code',
        shipping_within_days: GfApi.SHIPPING_WITHIN_DAYS.AUTO,  // Set auto delivery if you are going to store the digital code within Gameflip

        // USD is the default when not specified accept_currency
        //accept_currency: GfApi.ACCEPT_CURRENCY.FLP
        //accept_currency: GfApi.ACCEPT_CURRENCY.BOTH
    };
    let listing = await gfapi.listing_post(query);

    let code = "MY-GIFT-CARD-CODE-" + (new Date()).getTime();   // Digital code must be unique for each listing
    await gfapi.digital_goods_put(listing.id, code);

    // Upload an image to show in the listing page
    gfapi.upload_photo(listing.id, photo_url, 0).then(() => {
      // Upload another image to show in the search results
      return gfapi.upload_photo(listing.id, photo_url);
      // If you want to add a second image in the listing page then uncomment the two lines below:
      // }).then(() => {
      // return gfapi.upload_photo(listing.id, second_photo_url, 1);
    }).then(() => {
      // List the listing for sale
      //return gfapi.listing_status(listing.id, GfApi.LISTING_STATUS.ONSALE);
      return gfapi.listing_status(listing.id, GfApi.LISTING_STATUS.READY);
    }).catch(err => {
      console.log(err);
    });
}

// Run main() and catch any unhandle Promise errors
main().catch(err => {
    console.log('==== ERROR', err);
});
