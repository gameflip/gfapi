## Service: Exchange

The exchange service creates and manages sell-buy records.
A exchange is represented as a JSON document which is defined in the [Exchange](#exchange-document) doc.

Exchanges can have zero or more sources associated with them.

Service                        | Method | Documentation
-------------------------------|--------|--------------------------------
/api/v1/exchange               | POST   | [POST /api/v1/exchange](#post-apiv1exchange)


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
category             | string  | no      | Category from listing or 'GBUX' for gbux purchase
listing_id           | string  | no      | Id of listing in this exchange (missing for gbux purchase)
seller               | string  | no      | Owner of the listing, copy from listing (missing for gbux purchase)
buyer                | string  | no      | Buyer id
status               | string  | yes     | see latter description
price                | number  | no      | copy from listing (cents USD)
upc                  | string  | no      | copy from listing
shipping_fee         | number  | no      | copy from listing (cents USD)
shipping_paid_by     | string  | no      | copy from listing
shipping_from_state  | string  | no      | copy from listing
shipping_within_days | string  | no      | copy from listing
shipping_predefined_package | string | yes | copy from listing
shipping_handling    | string  | yes     | (deprecated) client shipping and handling action memoization
handling_status      | enum    | no      | one of: need_label, need_tracking, shipping, shipped
shipment_tracking    | Array   | no      | shipment tracking (no implemented yet)
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
(no status)        | create   |             | pending    | synchronous request to littlefish.exchange_app
pending            | settle   |             | settled    | handles prior partial failure and event re-delivery
pending            | cancel   |             | cancelled  | may be caused by partial failure from littlefish.exchange_app
cancelled          | settle   | cancel      | cancelled  | buyer cancels before system processing it
cancelled          | cancel   | cancel      | cancelled  | cancel event from littlefish patch request to cancel
rescinded          | rescind  | rescind     | rescinded  | buyer cancels if seller don't ship item after promised shipping days + X days passed, "shipping_within_days" is stored in listing
settled            | settle   | ignore      | settled    | verify only but should be event re-delivery
settled            | cancel   | reject      | settled    | too late. it is processed. (uncommon, unless race condition)
settled            | received | buyer rates | received   | notified by Easypost that item delivered OR when buyer rates seller
received           | (patch)  | seller rates| pending_completion | synchronous request to littlefish.exchange_app, then send Q to complete transaction
pending_completion | complete |             | complete   | all transaction completed

### All other state transitions not listed in this table receive rejection reaction
Event is consumed and error logged
### Three terminal states: cancelled, rescinded, complete.
Once reached one of the three states, exchange will not transition out

