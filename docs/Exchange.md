## Service: Exchange

The exchange service creates and manages sell-buy records.
A exchange is represented as a JSON document which is defined in the [Exchange](#exchange-document) doc.

Exchanges can have zero or more sources associated with them.

Service                        | Method | Documentation
-------------------------------|--------|--------------------------------
/api/v1/exchange               | GET    | [GET /api/v1/exchange](#get-apiv1exchange)
/api/v1/exchange               | POST   | [POST /api/v1/exchange](#post-apiv1exchange)

### GET /api/v1/exchange

Search for exchanges using a search index. The index is updated asynchronously after an exchange is updated, so there is a delay from update to indexed. The delay is normally a few seconds but can be longer in exceptional cases.

Searches by non-admin users are restricted to exchanges for which the requesting user has a role -- was either a buyer or a seller. The specific role can be narrowed if desired by including a role as a search field. Requests from admin are not restricted by the role and can match any exchange.

The exchange fields indexed, along with their type and supported search operations are listed below.

 * field: The name of the exchange property.  `*_id` means all properties that end with `*_id`
 * type: The data type which is repeated here but is the same as in the exchange.
   - boolean: can be either true or false
   - date: must be an RFC 3389 formatted date with milliseconds in the UTC timezone. Also accepts the special value of now
 * search operation: What sort of comparison the search performs.
   - in set: accepts one or more values and matches when the field matches any one of the provided values
   - fuzzy match: accepts one value and matches if the field loosely matches the search text. This is not exact and must never be used to enforce precise restrictions on content.
   - exactly one: accepts one value and matches if the field equals the value. Searching for multiple values like digital=true,false is not allowed since it just doesn't make sense.
   - range: accepts exactly two values and matches if the field value is GTE (greater than or equal) to the first value and LT (strictly less than) the second value. Range also accepts the special value of any when an open-ended range is desired.

Pagination uses limit and start integer parameters to indicate page size and position. The `next_page` URI is included in the response. The underlying search engine limits the page depth to 10,000 and an error will result if the results attempt to go further than that. For applications that need deep (but forward-only) paging, use a `last_key` value of initial and the `next_page` URI can be followed to any arbitrary page depth.

Field    | Type   | Search operation
---------|--------|-----------------
role     | string | in set (buyer/seller) -- defaults to any role
id,`*_id` | string | in set
name     | string | fuzzy match
buyer    | string | in set
seller   | string | in set
price    | number | range
risk     | number | range
status,`*_status` | string | in set
buyer_rated   | boolean | exactly one (true/false)
seller_rated  | boolean | exactly one (true/false)
category      | string | in set
upc      | string | in set
digital  | boolean | exactly one (true/false)
escrow	 | boolean | exactly one (true/false)
settled	 | date | range
shipped	 | date | range
received | date | range
auto_rate_after | date | range
created	 | date | range
updated	 | date | range
version	 | number | range

**sample request**

Search for exchanges bought from a particular user, after December 1 2016 that contain the term `flip knife`:

```http
GET /api/v1/exchange?role=buyer&seller=us-east-1:8140e966-e1ab-11e6-a74b-3c15c2c2663e&created=2016-12-01T00:00:00.000Z,any&name=flip+knife HTTP/1.1
Authorization: Gameflip 101a3f71e67e028ff390652002c69eae--f33d9d1ebeb1ee75bfd78fe6ba704604e06ba6
```

**response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "SUCCESS",
    "data": {
      "exchanges": [
        "exchange object"
      ],
      "found": 1,
      "start": 0
    },
    "next_page": "http://example.org/api/v1/exchange?role=buyer&seller=us-east-1:8140e966-e1ab-11e6-a74b-3c15c2c2663e&name=flip+knife&start=1"
}
```


### POST /api/v1/exchange

Create an exchange to either buy a listing

Parameters:

 * `listing_id` Specify listing to purchase. Required. 
 * `address_id` ship to address id from profile addresses. Required.

**sample request**

Purchase listing

```http
POST /api/v1/exchange HTTP/1.1
Authorization: Gameflip 101a3f71e67e028ff390652002c69eae--f33d9d1ebeb1ee75bfd78fe6ba704604e06ba6
Content-Type: application/json

{
 "listing_id":"effbc46c-09e3-4d77-bec5-10122a5801c6",
 "source_id":"785ef54e-0399-4da7-82de-956c48b3cf7f",
 "address_id": "c121c8a8-b8e7-4caf-aee4-c0dcdfc29986"
}
```

**sample response: purchase listing**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
 "status": "SUCCESS",
   "data": {
     "id": "ffdbb65a-e9f0-4078-80fb-807dd652f939",
     "listing_id": "effbc46c-09e3-4d77-bec5-10122a5801c6",
     "buyer": "us-fake-1:72f10ea0-f492-4f4d-b1c6-5a7df7de0f31",
     "status": "pending",
     "name": "D4: Dark Dreams Dont Die",
     "price": 40.0,
     "shipping_paid_by": "buyer",
     "handling_status": "need_label",
     "created": "2015-03-12T23:59:36.079Z",
     "updated": "2015-03-12T23:59:36.183Z"
     }
}
```

**sample error response**

listing does not exist

```http
HTTP/1.1 130
Content-Type: application/json

{
 "status": "FAILURE",
 "data": null,
 "error": {
   "message": "ArgumentError: cannot exchange as listing effbc46c-09e3-4d77-bec5-10122a5801 does not exist",
   "code": 130
 }
}
```
**sample error response**

listing is not on sale

```http
HTTP/1.1 113
Content-Type: application/json

{
 "status": "FAILURE",
 "data": null,
 "error": {
   "message": "ArgumentError: listing effbc46c-09e3-4d77-bec5-10122a5801c6 is not on sale",
   "code": 113
 }
}
```

## Exchange document

The exchange document allows the following fields

Sample exchange document

```json
  {
    "id": "ffdbb65a-e9f0-4078-80fb-807dd652f939",
    "listing_id": "effbc46c-09e3-4d77-bec5-10122a5801c6",
    "seller": "MuffnMan"
    "buyer": "Jack Sparrow",
    "status": "settled",
    "name": "Dying Light",
    "price": 4000,
    "upc": "123456789012",
    "shipping_fee": 250,
    "shipping_paid_by": "buyer",
    "shipping_from_state": "CA",
    "shipping_within_days": "5",
    "handling_status": "shipped",
    "shipment_tracking": [],
    "created": "2015-03-12T23:59:36.079Z",
    "updated": "2015-03-13T00:03:33.674Z",
    "version": 2
  }
```


Field                | Type    | Mutable |  Description
---------------------|---------|---------|---------------
id                   | string  | no      | Exchange id
category             | string  | no      | Category from listing
listing_id           | string  | no      | Id of listing in this exchange
seller               | string  | no      | Owner of the listing, copy from listing
buyer                | string  | no      | Buyer id
status               | string  | yes     | see latter description
price                | number  | no      | copy from listing (cents USD)
upc                  | string  | no      | copy from listing
shipping_fee         | number  | no      | copy from listing (cents USD)
shipping_paid_by     | string  | no      | copy from listing
shipping_from_state  | string  | no      | copy from listing
shipping_within_days | string  | no      | copy from listing
shipping_predefined_package | string | yes | copy from listing
handling_status      | enum    | no      | one of: need_label, need_tracking, shipping, shipped
shipment_tracking    | Array   | no      | shipment tracking (not implemented yet)
buyer_rated          | boolean | no      |
seller_rated         | boolean | no      |
message              | number  | yes     | total count of exchange private messages
auto_rate_after      | string  | no      | RFC3339 string 'YYYY-MM-DDThh:mm:ss.dddZ'
created              | string  | no      | RFC3339 string 'YYYY-MM-DDThh:mm:ss.dddZ'
updated              | string  | no      | RFC3339 string 'YYYY-MM-DDThh:mm:ss.dddZ'
version              | number  | no      | current version of object: incremented on update


# Exchange state transition

Current status     | Event    | Reaction    | New status | Note
-------------------|----------|-------------|------------|--------
(no status)        | create   |             | pending    | create new exchange when user place an order on the listing
pending            | settle   |             | settled    | handles prior partial failure and event re-delivery
pending            | cancel   |             | cancelled  | may be caused by failure
cancelled          | settle   | cancel      | cancelled  | buyer cancels before system processing it
cancelled          | cancel   | cancel      | cancelled  | cancel event 
rescinded          | rescind  | rescind     | rescinded  | buyer cancels if seller doesn't ship item after promised shipping days, "shipping_within_days" is stored in listing
settled            | settle   | ignore      | settled    | verify only but should be event re-delivery
settled            | cancel   | reject      | settled    | too late. it is processed. (uncommon, unless race condition)
settled            | received | buyer rates | received   | notified that item delivered OR when buyer rates seller
received           | (patch)  | seller rates| pending_completion |
pending_completion | complete |             | complete   | all transaction completed

### All other state transitions not listed in this table receive rejection reaction
Event is consumed and error logged
### Three terminal states: cancelled, rescinded, complete.
Once reached one of the three states, exchange will not transition out

