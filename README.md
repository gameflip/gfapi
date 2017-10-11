# GFAPI

Node.js API bindings and sample code create Gameflip listings for Steam items
* [REST API documentation](https://gameflip.github.io/gfapi)
* [Node.js GFAPI Bindings](https://gameflip.github.io/gfapi/gfapi/0.1.0/GfApi.html)
* [Node.js Sample Code](https://gameflip.github.io/gfapi/samples/bulk_listing.html)

### API Key and OTP secret

To get the API Key and secret, contact Gameflip support.
During Beta, API Keys are only being given out to select customers.

### 1. Install [NodeJS v8.x LTS](https://nodejs.org)

### 2. Download sample code
```
  git clone https://github.com/gameflip/gfapi.git
  cd gfapi
  npm install
```

### 3. Run Sample Code
```
  export GFAPI_KEY=<my_api_key>
  export GFAPI_SECRET=<my_api_secret>
  node src/samples/bulk_listing.js
```

### 4. For your own project, you just install gfapi npm
```
npm install 'gameflip/gfapi'
```