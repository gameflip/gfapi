### Getting Start
Login and go to the [Settings](https://gameflip.com/settings) menu at Gameflip.com.  Here you can either create your API Key
and TOTP secret or request to have Developer access.  Please specify how you intend to use the platform.  Due to limited
support, we only accept a small number of developers during the Beta period.  We will open up the developer access over time.

### Sample Code
* Node.js
  * [Create listings for CS2 items](https://gameflip.github.io/gfapi/samples/bulk_listing.html)
  * [Create listings for Fortnite items](https://gameflip.github.io/gfapi/samples/rl_listing.html)
  * [Show my listings](https://gameflip.github.io/gfapi/samples/my_listings.html)
  * [Search listings](https://gameflip.github.io/gfapi/samples/search_listing.html)
  * [Search exchanges](https://gameflip.github.io/gfapi/samples/search_exchange.html)
  * [GFAPI library](https://github.com/gameflip/gfapi)

### API Request

All API requests must provide an Authorization header:

    Authorization: GFAPI <apikey>:<totp>

To get the API Key and secret, contact Gameflip support.
During Beta, API Keys are only being given out to select customers.

Sample code to generate the Authorization header
* [Node.js](https://gameflip.github.io/gfapi/samples/authorization.html)
* [Ruby](https://gameflip.github.io/gfapi/samples/authorization_ruby.html)

### API Response

For http methods that support a response body, the API always responds with a json document which contains
at least the `status` field. Other fields follow in the `data` section which can be an array of similar objects
or a single object.


**sample response: single object**

```json
{
  "status": "SUCCESS",
  "data": { "id": "... listing data object as defined in Listing.md ..." }
}
```

**sample response: list of objects**

```json
{
  "status": "SUCCESS",
  "data": [
    { "id": "... listing data object 1 as defined in Listing.md ..." },
    { "id": "... listing data object 2 as defined in Listing.md ..." }
  ]
}
```

**sample response: failure message**

```json
{
  "status": "FAILURE",
  "data": null,
  "error": {
    "message": "error message",
    "code": 400
  }
}
```

## Service: [Profile](Profile.md)

Service                            | Method | Documentation
-----------------------------------|--------|--------------
/api/v1/account/:id/profile        | GET    | [GET /api/v1/account/:id/profile](Profile.md#get-apiv1accountidprofile)
/api/v1/account/me/profile         | GET    | [GET /api/v1/account/me/profile](Profile.md#get-apiv1accountmeprofile)

## Service: [Account](Account.md)

Service                           | Method | Documentation
----------------------------------|--------|--------------
/api/v1/account/me/wallet_history | GET    | [GET /api/v1/account/me/wallet_history](Account.md#get-apiv1accountmewallet_history)

## Service: [Listing](Listing.md)

The listing service is used to create and manipulate listing of items for sale. A listing is represented
as a JSON document which is defined in the [Listing document](Listing.md#listing-document).

Listings can have zero or more photos associated with them.

Service                     | Method | Documentation
----------------------------|--------|--------------
/api/v1/listing             | GET    | [GET /api/v1/listing](Listing.md#get-apiv1listing)
/api/v1/listing             | POST   | [POST /api/v1/listing](Listing.md#post-apiv1listing)
/api/v1/listing/:id         | GET    | [GET /api/v1/listing/:id](Listing.md#get-apiv1listingid)
/api/v1/listing/:id         | PATCH  | [PATCH /api/v1/listing/:id](Listing.md#patch-apiv1listingid)
/api/v1/listing/:id         | DELETE | [DELETE /api/v1/listing/:id](Listing.md#delete-apiv1listingid)
/api/v1/listing/:id/photo   | POST   | [POST /api/v1/listing/:id/photo](Listing.md#post-apiv1listingidphoto)

## Service: [Exchange](Exchange.md)

The exchange service creates and manages sell-buy records.
A exchange is represented as a JSON document which is defined in the [Exchange document](Exchange.md#exchange-document).

Exchanges can have zero or more sources associated with them.

Service                        | Method | Documentation
-------------------------------|--------|--------------------------------
/api/v1/exchange               | POST   | [POST /api/v1/exchange](Exchange.md#post-apiv1exchange)

## Service: [Steam Escrow](SteamEscrow.md)

The escrow service is used to escrow Steam items.

Service                   | Method | Documentation
--------------------------|--------|--------------
/api/v1/steam/escrow/hold | GET    | [GET /api/v1/steam/escrow/hold](SteamEscrow.md#get-apiv1steamescrowhold)
/api/v1/steam/escrow/mine | GET    | [GET /api/v1/steam/escrow/mine](SteamEscrow.md#get-apiv1steamescrowmine)
/api/v1/steam/escrow/:id  | GET    | [GET /api/v1/steam/escrow/:id](SteamEscrow.md#get-apiv1steamescrowid)

## Service: [Steam Bulk](SteamBulk.md)

The bulk service allows you to create listings/escrow for multiple Steam items with one trade offer.

Service                 | Method | Documentation
------------------------|--------|--------------
/api/v1/steam/bulk/mine | GET    | [GET /api/v1/steam/bulk/mine](SteamBulk.md#get-apiv1steambulkmine)
/api/v1/steam/bulk      | POST   | [POST /api/v1/steam/bulk](SteamBulk.md#post-apiv1steambulk)
/api/v1/steam/bulk/:id  | PUT    | [PUT /api/v1/steam/bulk/:id](SteamBulk.md#put-apiv1steambulkid)
/api/v1/steam/bulk/:id  | GET    | [GET /api/v1/steam/bulk/:id](SteamBulk.md#get-apiv1steambulkid)

