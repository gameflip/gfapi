## Service: Bulk

Service                 | Method | Documentation
------------------------|--------|--------------
/api/v1/steam/bulk/mine | GET    | [GET /api/v1/steam/bulk/mine](#get-apiv1steambulkmine)
/api/v1/steam/bulk      | POST   | [POST /api/v1/steam/bulk](#post-apiv1steambulk)
/api/v1/steam/bulk/:id  | PUT    | [PUT /api/v1/steam/bulk/:id](#put-apiv1steambulkid)
/api/v1/steam/bulk/:id  | GET    | [GET /api/v1/steam/bulk/:id](#get-apiv1steambulkid)

The Bulk object has the following status state transitions:

```code
              +-- steam_escrow --+
              |                  v
start <-> receive_pending --> received -----> listed
                                 |               ^
                                 +-> trade_hold -+
```

#### Bulk status
* **steam_escrow**
Steam has the items until *held_until* date (usually 15 days later).
This occurs if the account recently enabled mobile authenticator or changed
email address or phone number. In rare cases, Steam cancels the trade--
if so, the state reverts to *start* (not shown in diagram).
* **trade_hold**
For H1Z1, the trade items are delivered but cannot again be traded for 7 days.
Bruce creates escrow and listings with escrow status *trade_hold*.
When the trade hold expires (after *held_until* date), Bruce will change the escrow status to *received*
and put listing *onsale* if requested.

### GET /api/v1/steam/bulk/mine

Get list of bulks by status, sorted with recently updated first.

Can specify 'status' as query parameter to filter (start, receive_pending, received, listed).
Default is 'start'.

Can specify 'limit' (default: 20, max: 100). If more data, 'next_page' contains URL to query next set of data.

**sample request**

```http
GET /api/v1/steam/bulk/mine?status=listed HTTP/1.1
Authorization: GFAPI <apikey>:<totp>
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": [
    {
      "id": "b4ef3e91-dca9-46ea-8e4b-5f38062fb26d",
      "owner": "us-fake-1:abcdef01-2345-6789-809c-77a08908499f",
      "offer_key": "Ol4YAU5g-l0w",
      "num_listed": 2,
      "listings": [
        {
          "id": "f005c650-567c-4494-85ef-57cc567d27cc",
          "status": "draft"
        },
        {
          "id": "555f8301-2f3f-451d-b69f-7a2fe0241016",
          "status": "draft"
        }
      ],
      "status": "listed",
      "updated": "2017-01-23T22:52:03.627Z",
      "created": "2017-01-14T00:59:50.569Z"
    }
  ],
  "next_page": "/api/v1/steam/bulk/mine?limit=1&owner=us-fake-1%3Aabcdef01-2345-6789-809c-77a08908499f&listing_id=6d357d63-e167-4edf-b6ca-6676597b2475&status=received"
}
```

### POST /api/v1/steam/bulk

Create bulk object

**sample request**

```http
POST /api/v1/steam/bulk HTTP/1.1
Authorization: GFAPI <apikey>:<totp>
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "id": "b4ef3e91-dca9-46ea-8e4b-5f38062fb26d",
    "owner": "us-fake-1:abcdef01-2345-6789-809c-77a08908499f",
    "offer_key": "Ol4YAU5g-l0w",
    "status": "start",
    "updated": "2017-01-21T02:03:56.164Z",
    "created": "2017-01-21T02:03:56.164Z"
  }
}
```

### PUT /api/v1/steam/bulk/:id

If items specified, creates trade offer.
If no items specified, it checks the status of the trade offer.
If offer accepted, it asynchronously creates listings and escrows.

This can be called multiple times and will return bulk status.

Specify bulk id (from post) in URL.
In PUT params, specify list of items to escrow/list.

**sample request**

Create offer

Specify list of items in seller's inventory.
If item price and market_hash_name not specified, listing goes to 'draft'.

```http
PUT /api/v1/steam/bulk/b4ef3e91-dca9-46ea-8e4b-5f38062fb26d HTTP/1.1
Authorization: GFAPI <apikey>:<totp>
Content-Type: application/json

{
  "listing_status": "ready",
  "items": [{
    "id": "8454804348",
    "appid": "730",
    "price": 1000,
    "market_hash_name": "Chroma 3 Case"
  },{
    "id": "8454795030",
    "appid": "730",
    "price": 1000,
    "market_hash_name": "Chroma 3 Case"
  }]
}
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "id": "b4ef3e91-dca9-46ea-8e4b-5f38062fb26d",
    "owner": "us-fake-1:abcdef01-2345-6789-809c-77a08908499f",
    "offer_key": "Ol4YAU5g-l0w",
    "status": "receive_pending",
    "updated": "2017-01-21T02:24:40.977Z",
    "created": "2017-01-21T02:03:56.164Z"
  }
}
```

**sample request**

Check status of offer

```http
PUT /api/v1/steam/bulk/b4ef3e91-dca9-46ea-8e4b-5f38062fb26d HTTP/1.1
Authorization: GFAPI <apikey>:<totp>
```

**sample response**

Received (bot has items but all or some listing/escrows have not been created)

Note: Where item pricing is ambigious (non-fungible items with same market_hash_name but different prices),
they will be created in draft mode with no price.

Items are fungible if item.name == item.market_hash_name.

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "id": "b4ef3e91-dca9-46ea-8e4b-5f38062fb26d",
    "owner": "us-fake-1:abcdef01-2345-6789-809c-77a08908499f",
    "offer_key": "Ol4YAU5g-l0w",
    "status": "received",
    "num_listed": 0,
    "listings": [
      {
        "id": "f005c650-567c-4494-85ef-57cc567d27cc",
        "status": "ready",
        "price": 1000,
        steam_properties: {
            "name": "Chroma 3 Case",
            "market_hash_name": "Chroma 3 Case"
        }
      },
      {
        "id": "555f8301-2f3f-451d-b69f-7a2fe0241016",
        "status": "ready",
        "price": 1000,
        steam_properties: {
            "name": "Chroma 3 Case",
            "market_hash_name": "Chroma 3 Case"
        }
      }
    ],
    "updated": "2017-01-21T02:29:53.511Z",
    "created": "2017-01-21T02:03:56.164Z"
  }
}
```

**sample response**

Listed: all listings and escrows have been created, but search index may still be pending.
Use listing_ids to ensure that you have all created listings.

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "id": "b4ef3e91-dca9-46ea-8e4b-5f38062fb26d",
    "owner": "us-fake-1:abcdef01-2345-6789-809c-77a08908499f",
    "offer_key": "Ol4YAU5g-l0w",
    "status": "listed",
    "num_listed": 2,
    "listings": [
      {
        "id": "f005c650-567c-4494-85ef-57cc567d27cc",
        "status": "draft"
      },
      {
        "id": "555f8301-2f3f-451d-b69f-7a2fe0241016",
        "status": "draft"
      }
    ],
    "updated": "2017-01-21T02:29:53.511Z",
    "created": "2017-01-21T02:03:56.164Z"
  }
}
```

### GET /api/v1/steam/bulk/:id

Get bulk

**sample request**


```http
GET /api/v1/steam/bulk/b4ef3e91-dca9-46ea-8e4b-5f38062fb26d HTTP/1.1
Authorization: GFAPI <apikey>:<totp>
```

**sample response**

Listed: all listings and escrows have been created, but search index may still be pending.
Use listing_ids to ensure that you have all created listings.

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "id": "b4ef3e91-dca9-46ea-8e4b-5f38062fb26d",
    "owner": "us-fake-1:abcdef01-2345-6789-809c-77a08908499f",
    "offer_key": "Ol4YAU5g-l0w",
    "status": "listed",
    "num_listed": 2,
    "listings": [
      {
        "id": "f005c650-567c-4494-85ef-57cc567d27cc",
        "status": "draft"
      },
      {
        "id": "555f8301-2f3f-451d-b69f-7a2fe0241016",
        "status": "draft"
      }
    ],
    "updated": "2017-01-21T02:29:53.511Z",
    "created": "2017-01-21T02:03:56.164Z"
  }
}
```

