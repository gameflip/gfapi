# GFAPI

Node.js API bindings and sample code create Gameflip listings for Steam items
* [REST API documentation](https://gameflip.github.io/gfapi)
* [Node.js GFAPI Bindings](https://gameflip.github.io/gfapi/gfapi/0.1.1/GfApi.html)
* Node.js Sample Code
  * [Steam Bulk Listing](https://gameflip.github.io/gfapi/samples/bulk_listing.html)
  * [Fortnite Listing](https://gameflip.github.io/gfapi/samples/rl_listing.html)
  * [Gift Card Listing](https://gameflip.github.io/gfapi/samples/giftcard_listing.html)
  * [Search Listing](https://gameflip.github.io/gfapi/samples/search_listing.html)
  * [My Listings](https://gameflip.github.io/gfapi/samples/my_listings.html)
  * [My Wallet](https://gameflip.github.io/gfapi/samples/my_wallet.html)

### API Key and OTP secret

To get the API Key and secret, contact Gameflip support.
During Beta, API Keys are only being given out to select customers.

### 1. Install [Git](https://git-scm.com/downloads), [NodeJS v12 LTS](https://nodejs.org), and [Python 2.7.14](https://www.python.org/downloads/release/python-2714/)

### 2. Download sample code
```
  git clone https://github.com/gameflip/gfapi.git
```

### 3. Install dependencies
```
  cd gfapi
  npm install
```

(Optional) Mac and Linux:  
This command converts `src/samples/*.js` files into HTML as seen on the [documentation website](https://gameflip.github.io/gfapi/samples/search_listing.html).
```
  npm run-script docs
```

### 4. Run Sample Code
Mac and Linux:
```
  export GFAPI_KEY=<my_api_key>
  export GFAPI_SECRET=<my_api_secret>
  node src/samples/search_listing.js
```
Windows:
```
  SET GFAPI_KEY=<my_api_key>
  SET GFAPI_SECRET=<my_api_secret>
  node src\samples\search_listing.js
```

### 5. For your own project, you just install gfapi npm
```
npm install 'gameflip/gfapi'
```
