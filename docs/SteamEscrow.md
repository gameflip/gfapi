## Service: Escrow

Service                   | Method | Documentation
--------------------------|--------|--------------
/api/v1/steam/escrow/hold | GET    | [GET /api/v1/steam/escrow/hold](#get-apiv1steamescrowhold)
/api/v1/steam/escrow/mine | GET    | [GET /api/v1/steam/escrow/mine](#get-apiv1steamescrowmine)
/api/v1/steam/escrow/:id  | GET    | [GET /api/v1/steam/escrow/:id](#get-apiv1steamescrowid)

The Escrow object has the following status state transitions:

```code

received <--> deliver_pending --> delivered
     ^                             
     |                             
     +----> return_pending -----> returned

```

Note: there are additional states (start, receive_pending, received, steam_escrow, and trade_hold)
for creating single escrow that is not be supported for GFAPI.

### GET /api/v1/steam/escrow/hold

Checks if there is a trade hold or ban. This will tell if the user and bot are authorized to trade
and if the item will be held in *steam_escrow*.
Returns SUCCESS if okay to trade.
Returns 422 error if trade hold with error message on reason.

**sample request**

```http
GET /api/v1/steam/escrow/hold HTTP/1.1
Authorization: GFAPI <apikey>:<totp>
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
  }
}
```

**sample error response**

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "status": "FAILURE",
  "data": null,
  "error": {
    "message": "Steam says you have a trade ban or restriction--see http://goo.gl/7MLvFU",
    "code": 422
  }
}
```

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "status": "FAILURE",
  "data": null,
  "error": {
    "message": "Steam says you have a trade hold with 15 day(s) left--see http://goo.gl/7MLvFU",
    "code": 422
  }
}
```

### GET /api/v1/steam/escrow/mine

Get list of your escrows (subset of fields), ordered so recently updated first.

Can specify 'status' as query parameter to filter.
Can specify 'limit' (default: 20, max: 100).

Returns list of escrows. If more data, 'next_page' contains URL to query next set of data.

**sample request**

```http
GET /api/v1/steam/escrow/mine?status=received&limit=1 HTTP/1.1
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
      "owner": "us-fake-1:abcdef01-2345-6789-809c-77a08908499f",
      "listing_id": "6d357d63-e167-4edf-b6ca-6676597b2475",
      "status": "received",
      "created": "2016-06-02T03:42:35.607Z"
    }
  ],
  "next_page": "/api/v1/steam/escrow/mine?limit=1&owner=us-fake-1%3Aabcdef01-2345-6789-809c-77a08908499f&listing_id=6d357d63-e167-4edf-b6ca-6676597b2475&status=received"
}
```

**sample error response**

Unauthorized

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "status": "FAILURE",
  "data": null,
  "error": {
    "message": "Unauthorized",
    "code": 401
  }
}
```

### GET /api/v1/steam/escrow/:id

Get escrow data for given listing id. Caller must own listing. 

Specify listing id in URL.

**sample request**

```http
GET /api/v1/steam/escrow/a241e4be-acb4-4195-8452-161ba91edf0d HTTP/1.1
Authorization: GFAPI <apikey>:<totp>
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "owner": "us-fake-1:abcdef01-2345-6789-809c-77a08908499f",
    "listing_id": "d3987deb-0c61-47af-8e84-14bbc4dae821",
    "idempotency_key": "RBm8J3nmFUZF",
    "items": [
      {
        "icon_url": "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFYznarJJjkQ6ovjw4SPlfP3auqEl2oBuJB1j--WoY322QziqkdpZGr3IteLMlhpw4RJCv8",
        "amount": 1,
        "classid": "1797256701",
        "appid": "730",
        "name": "Gamma Case",
        "tradable": 1,
        "owner_steamid": "76561198261175324",
        "market_hash_name": "Gamma Case",
        "contextid": "2",
        "id": "12149706442",
        "type": "Base Grade Container"
      }
    ],
    "status": "received",
    "updated": "2017-10-04T01:55:18.610Z",
    "created": "2017-10-04T01:55:18.610Z"
  }
}
```

**sample error response**

Unauthorized

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "status": "FAILURE",
  "data": null,
  "error": {
    "message": "Unauthorized",
    "code": 401
  }
}
```
