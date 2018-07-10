## Service: Listing

The listing service is used to create and manipulate listing of items for sale. A listing is represented
as a JSON document which is defined in the [Listing](#listing-document) doc.

Listings can have zero or more photos associated with them.

Service                              | Method | Documentation
-------------------------------------|--------|--------------
/api/v1/listing                      | GET    | [GET /api/v1/listing](#get-apiv1listing)
/api/v1/listing                      | POST   | [POST /api/v1/listing](#post-apiv1listing)
/api/v1/listing/:id                  | GET    | [GET /api/v1/listing/:id](#get-apiv1listingid)
/api/v1/listing/:id                  | PATCH  | [PATCH /api/v1/listing/:id](#patch-apiv1listingid)
/api/v1/listing/:id                  | DELETE | [DELETE /api/v1/listing/:id](#delete-apiv1listingid)
/api/v1/listing/:id/photo            | POST   | [POST /api/v1/listing/:id/photo](#post-apiv1listingidphoto)

### GET /api/v1/listing

Search for listings. Response is paginated and ordered.

Many search and filtering options are supported including:

property         | filter type | data type | notes
---------        |-------------|---------- |-------
term             | fuzzy       | text      | searches listing `name` and `description` and generates relevance score
category         | term        | text      |
platform         | term        | text      |
genre            | term        | text      |
upc              | term        | text      |
shipping_paid_by | term        | text      | `buyer` or `seller`
digital          | term        | boolean   | `true` or `false`
status           | term        | text      |
owner            | term        | text      |
condition        | range       | text      |
condition_min    | range       | text      | any one value defined for `condition`
price            | range       | integer   |
onsale           | range       | date      | alias for `created` currently but may change
created          | range       | date      |
updated          | range       | date      |
expiration       | range       | date      |
tags             | term        | text      |

Required arguments: none

Sort order is controlled with a request parameter `sort` which accepts an array of fieldname:direction values for any range term. Direction values must be one of `desc` or `asc` but defaults to `asc`. The special fieldname of `_score` is used to order by relevance when search property includes `term`. Sorting by `_score` when `term` is not provided has no effect since all results have the same score (or possibly no score). Sort defaults to `_score:desc,created:desc`.

Default search parameters filter for listing `status` of onsale or sold and not expired: (`status='onsale,sold' && expiration=now,`)

Filter type of `term` selects any listing with the property equal to any one of the provided values.
 - `tags` is a special `term` filter which also allows logical AND using the carrot `^` operator in addition to logical OR with comma `,`. Precenence is given to OR operations over AND so that a filter like `tags=a,b^c^d,e` will match all listings that have `(a OR b) AND (c) AND (d OR e)`
 - alternatively, tags can be specified as url-safe encode base64 (RFC 4648) JSON array of tag strings. The strings in the first level of the array are logical AND, while the second level are logical OR. See examples below.

Filter type of `range` selects any listing with the property between (inclusive) the two provided values.

Data type `date` values must be:
 - a valid RFC 3339 zulu date string like *2015-06-03T18:04:22.765Z*
 - the string `now`
 - an empty string (only one end of an open-ended range)

For example `expiration=now,` matches any listing that expires now or later (not expired):

Not all filter values are available to all users. An admin can filter by any value and the listing owner can filter by any value for their own listings. Requests to search for listings that should not be visible to the requester will be rejected. Requests for status of draft or expired listings for example will fail unless made by the listing owner or an admin.


**sample request**

```
GET /api/v1/listing HTTP/1.1
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": [
    {
      "id": "13086deb-aa83-4baf-8cd5-17c99bd3e2e8",
      "name": "Castle Wolfenstein",
      "description": "One of the original FPS games",
      "category": "games",
      "platform": "PS3",
      "price": 12300,
      "photo": {
          "d4a011d2-2523-4db4-91b1-2fe65d5ed4f8": {
            "status": "active",
            "view_url": "https://s3.amazonaws.com/api/v1/listing-photo/13086deb-aa83-4baf-8cd5-17c99bd3e2e8/d4a011d2-2523-4db4-91b1-2fe65d5ed4f8",
          }
      }
    },
    {
      "id": "f612dbce-7e69-4479-a028-255df318cb7c",
      "description": "abc",
      "category": "abc",
      "platform": "Wii",
      "price": 456
    }
  ],
  "next_page": "/api/v1/listing?after=f612dbce-7e69-4479-a028-255df318cb7c"
}
```

**failure response**

```http
HTTP/1.1 404 NOT FOUND
Content-Type: application/json

{
  "status": "FAILURE",
  "data": null,
  "error": {
    "message": "Not Found",
    "code": 404
  }
}
```



**sample request**

GET with several search parameters

```http
GET /api/v1/listing?category=game&platform=Xbox+One,Wii,Wii+U,PS3,PS4&price=1000,3000&genre=action,survival,adventure&condition_min=like+new&sort=price:asc,onsale:desc HTTP/1.1
```


**sample response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": [
    {
      "id": "1c48ad76-3c70-4524-a95d-0622aa1c7778",
      "description": "Skyward Sword follows an incarnation of the series protagonist Link who was raised in a society above the clouds known as Skyloft.",
      "category": "game",
      "name": "The Legend of Zelda: Skyward Sword",
      "platform": "Wii",
      "genre": [
        "action",
        "adventure"
      ],
      "condition": "like new",
      "price": 2550,
      "status": "onsale",
      "shipping_paid_by": "buyer",
      "expiration": "2018-01-04T12:30:26.805Z"
    }
  ]
}
```


Search filtering using `tags` works like other term filters which match if any one of multiple values provided is found in the listing. However,
there is additional support for logical AND which requires that all values be present.

Search for listings with tags of either Type:Knife OR Weapon:Bayonet

```http
GET /api/v1/listing?tags=Type:Knife,Weapon:Bayonet HTTP/1.1
```


Search for listings with tags of both Type:Knife AND Weapon:Bayonet

```http
GET /api/v1/listing?tags=Type:Knife^Weapon:Bayonet HTTP/1.1
```

For equivalent in url-safe base64 encoded JSON array, prefix with `~` so
```ruby
   tags = `~` + Base64.urlsafe_encode64(["Type:Knife", "Weapon:Bayonet"].to_json)
```

```http
GET /api/v1/listing?tags=~WyJUeXBlOktuaWZlIiwiV2VhcG9uOkJheW9uZXQiXQ== HTTP/1.1
```

Search for listings with tags for Faction:Alliance AND ItemType:Armor OR ItemType:Weapon. Results will all be weapons or armor usable by alliance faction.

```http
GET /api/v1/listing?tags=Faction:Alliance^ItemType:Armor,ItemType:Weapon HTTP/1.1
```

For equivalent in url-safe base64 encoded JSON array, prefix with `~` so
```ruby
   tags = `~` + Base64.urlsafe_encode64(["Faction:Alliance", ["ItemType:Armor", "ItemType:Weapon"]].to_json)
```
Basically, first level of array is AND and second level of array is OR.   

```http
GET /api/v1/listing?tags=~WyJGYWN0aW9uOkFsbGlhbmNlIixbIkl0ZW1UeXBlOkFybW9yIiwiSXRlbVR5cGU6V2VhcG9uIl1d HTTP/1.1
```


### GET /api/v1/listing/:id

Get single listing by id. The listing owner can view any listing they own. An admin can view any listing. Anyone else may only view listings that are publicly viewable or get an error.

**sample request**

```http
GET /api/v1/listing/13086deb-aa83-4baf-8cd5-17c99bd3e2e8 HTTP/1.1
```


**sample response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "id": "13086deb-aa83-4baf-8cd5-17c99bd3e2e8",
    "name": "Sonic",
    "description": "He's a fast, blue, hedgehog",
    "category": "games",
    "platform": "PSP",
    "price": 1230
  }
}
```


### POST /api/v1/listing
Create a new listing and return the new listing object. The POST body may contain an optional json document of the new listing to
be created.

**sample request with no body**

```http
POST /api/v1/listing HTTP/1.1
Authorization: Gameflip 101a3f71e67e028ff390652002c69eae--f33d9d1ebeb1ee75bfd78fe6ba704604e06ba6
Content-Type: application/json
Content-Length: 0
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Location: /api/v1/listing/f612dbce-7e69-4479-a028-255df318cb7c
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "id": "f612dbce-7e69-4479-a028-255df318cb7c"
  }
}
```

**sample request with json body**

```http
POST /api/v1/listing HTTP/1.1
Authorization: Gameflip 101a3f71e67e028ff390652002c69eae--f33d9d1ebeb1ee75bfd78fe6ba704604e06ba6
Content-Type: application/json

{
  "name": "Mr Toads Wild Ride",
  "description": "Loved this game since I was 4 but now I'm too old for it",
  "price": 1805
}
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Location: /api/v1/listing/15e9f056-b5b8-4db0-93d9-5d093f49c4a4
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "id": "15e9f056-b5b8-4db0-93d9-5d093f49c4a4",
    "name": "Mr Toads Wild Ride",
    "description": "Loved this game since I was 4 but now I'm too old for it",
    "price": 1805
  }
}
```

### PATCH /api/v1/listing/:id
Update an existing listing with new content. Allows the caller to send only the portions of a listing document
which have changed and should be applied to an existing listing.

See [RFC5789](http://tools.ietf.org/html/rfc5789) and [RFC6902](http://tools.ietf.org/html/rfc6902) for more information
on PATCH method and http://jsonpatch.com for implementations supporting it.

Our API requires client to set "Content-Type: application/json-patch+json" in request.

The listing document being patched does not contain the API response headers (status, data) elements.

**sample request**

```http
PATCH /api/v1/listing/f612dbce-7e69-4479-a028-255df318cb7c HTTP/1.1
Authorization: Gameflip 101a3f71e67e028ff390652002c69eae--f33d9d1ebeb1ee75bfd78fe6ba704604e06ba6
Content-Type: application/json-patch+json
If-Match: "1"

[
  { "op": "test", "path": "/price", "value": 1000 },
  { "op": "add", "path": "/description", "value": "most awesome game evar!" },
  { "op": "replace", "path": "/price", "value": 123 },
  { "op": "replace", "path": "/genre", "value": ["puzzle", "shooter"] },
  { "op": "add", "path": "/genre", "value": "card battle" },
  { "op": "remove", "path": "/genre", "value": "puzzle" }
]
```


**sample response**

```http
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "2"

{
  "status": "SUCCESS",
  "data": {
    "id": "f612dbce-7e69-4479-a028-255df318cb7c",
    "version": "2",
    "description": "most awesome game evar!",
    "price": 123
  }
}
```

**sample failure (If-Match check fails)**

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "status": "FAILURE",
  "data": null,
  "error": {
    "message": "If-Match check failed (concurrent modifications)",
    "code": 412
  }
}
```

The patch method is also used to manipulate the listing photo details. This example
sets a photo to active, sets the display_order to 1, and sets another photo as the cover photo.

**sample request to edit photo details**

```http
PATCH /api/v1/listing/f612dbce-7e69-4479-a028-255df318cb7c HTTP/1.1
Authorization: Gameflip 101a3f71e67e028ff390652002c69eae--f33d9d1ebeb1ee75bfd78fe6ba704604e06ba6
Content-Type: application/json-patch+json
If-Match: "2"

[
  { "op": "replace", "path": "/photo/91b5f04d-5470-4948-b5b1-0a534ce40336/status", "value": "active" },
  { "op": "replace", "path": "/photo/91b5f04d-5470-4948-b5b1-0a534ce40336/display_order", "value": 1 },
  { "op": "replace", "path": "/cover_photo", "value": "818d957e-0dc3-418c-b56c-f226aabb35de" }
]
```

**sample request to delete photo**

```http
PATCH /api/v1/listing/f612dbce-7e69-4479-a028-255df318cb7c HTTP/1.1
Authorization: Gameflip 101a3f71e67e028ff390652002c69eae--f33d9d1ebeb1ee75bfd78fe6ba704604e06ba6
Content-Type: application/json-patch+json
If-Match: "2"

[
  { "op": "remove", "path": "/photo/91b5f04d-5470-4948-b5b1-0a534ce40336" }
]
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "3"

{
  "status": "SUCCESS",
  "data": {
    "id": "f612dbce-7e69-4479-a028-255df318cb7c",
    "version": "3",
    "description": "most awesome game evar!",
    "price": 123,
    "photo": {
        "91b5f04d-5470-4948-b5b1-0a534ce40336": {
          "status": "active",
          "display_order": 1,
          "view_url": "https://s3.amazonaws.com/api/v1/listing-photo/13086deb-aa83-4baf-8cd5-17c99bd3e2e8/91b5f04d-5470-4948-b5b1-0a534ce40336"
        },
        "818d957e-0dc3-418c-b56c-f226aabb35de": {
          "status": "active",
          "view_url": "https://s3.amazonaws.com/api/v1/listing-photo/13086deb-aa83-4baf-8cd5-17c99bd3e2e8/818d957e-0dc3-418c-b56c-f226aabb35de"
        }
      },
      "cover_photo": "818d957e-0dc3-418c-b56c-f226aabb35de"
  }
}
```


### DELETE /api/v1/listing/:id
Deletes a listing. The listing details will no longer be available. The listing may continue to show up in searches
until the removal is processed by the search indexes.

**sample request**

```http
DELETE /api/v1/listing/13086deb-aa83-4baf-8cd5-17c99bd3e2e8 HTTP/1.1
Authorization: Gameflip 101a3f71e67e028ff390652002c69eae--f33d9d1ebeb1ee75bfd78fe6ba704604e06ba6
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS"
}
```


### POST /api/v1/listing/:id/photo
Create a new `photo_id` and obtain a url that the photo should be uploaded to using an http PUT. Additionally,
the response will contain a callback url to allow access to update the photo status and download the photo.

**sample request**

```http
POST /api/v1/listing/13086deb-aa83-4baf-8cd5-17c99bd3e2e8/photo HTTP/1.1
Authorization: Gameflip 101a3f71e67e028ff390652002c69eae--f33d9d1ebeb1ee75bfd78fe6ba704604e06ba6
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Location: /api/v1/listing/13086deb-aa83-4baf-8cd5-17c99bd3e2e8/photo/b4a07169-3365-47ba-ac12-1e03ceb10175
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "status": "pending",
    "view_url": "https://s3.amazonaws.com/api/v1/listing-photo/13086deb-aa83-4baf-8cd5-17c99bd3e2e8/b4a07169-3365-47ba-ac12-1e03ceb10175",
    "upload_url": "https://s3.amazonaws.com/api/v1/listing-photo/13086deb-aa83-4baf-8cd5-17c99bd3e2e8/b4a07169-3365-47ba-ac12-1e03ceb10175?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAJBCACU77XZ6TBNYQ%2F20150202%2Fus-fake-1%2Fs3%2Faws4_request&X-Amz-Date=20150202T221233Z&X-Amz-Expires=900&X-Amz-Security-Token=AQoDYXdzEK%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEa4AM8WSW0VANbP%2BdsCirbRugFnOthWdxgPV4EYwhUgXQW3TteVWVEAIW4t1eTEYbNtxKn0gyvqOtWyJRomKB8X11qMvnYrAiE5i7pTuEvN8sf77%2BGS%2BJsr1OBHncZzrg6rlShSUoo%2FZNYXzLRoShxi2lcLK1XCvYPIin0ZO%2FNZSLIThdTNoHSQ337lxzygLNIR%2FFbQ3MO%2FewV5ySFYwvnYUB2960ffSf5M1XUbjEY91EdnjapoEIASdQowW53FV4N4Owk1kSyRkEf2B6Wvur1v%2FFrCCCZMXaKupCjDNcLiKVAiat9GVsUq2KruCkG7nA6UOoAltr9PrRLo%2F2J7rCyC1ljSvF9tVQFySgWwhHpGqXIxcxCNysVr4OS8BFGxPDieJ%2B5TU1JqjM%2BGCGhNdxzc5hawABdla74PwN%2FzCt6vpvZADdr3e7oNGaJzzG0FSJ2x0chG6yTqfQVVTzBoYUMhkMzHQzhOKafzKYYUZhzGFkUu8akPlGQQYml5lSi0NBwAvfA2ne%2BoG4jbKJi2LWaZHOeHPoKGBBpzbsufcpHgN0KqgLJ3ipjiHxq5cgSeF6Yh5ZDXJuKQ1OgkW9q%2B1f%2BtYJ%2FZH4FZxMplL2B3zC8ZQQaot1DimsIgNqWzAPlJdiw%2FPkgxeK%2FpgU%3D&X-Amz-SignedHeaders=host&X-Amz-Signature=50df68b4bac0e5773d50718a2437518efad753c567a1886f4fa98e3c64320199"
  }
}
```

The photo binary itself should be uploaded to the `upload_url` from the response ASAP since the `upload_url` will
contain expiring authentication tokens and will only allow the upload to be performed for a short period of time.
Note that S3 does make some demands of user-agents that are not well supported from some libraries.
See http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTRedirect.html

For S3 storage, the upload could be performed using a cURL command similar to this to upload a file named myphoto.jpg

```
curl -sSL -X PUT -H "Content-Type: image/jpeg" -H "Content-MD5: $(md5 myimage.jpg | awk -F= '{ print $2 }')" --data-binary @myimage.jpg --url *upload_url*
```

## Listing document

The listing document allows the following fields

Sample listing document

```json
{
  "id": "13086deb-aa83-4baf-8cd5-17c99bd3e2e8",
  "name": "Call of Duty 4: Day One Collectors Edition",
  "version": "3",
  "description": "I loved this game and played it every day. It is in great shape and still plays great. I have the case and manual but not the special ghost mask that came with this deluxe version.",
  "category": "games",
  "price": 2399,
  "platform": "PS3",
  "genre": ["FPS", "Action"],
  "condition": "good",
  "upc": "12345678999",
  "owner": "98ab65d3-f814-4fb2-9d99-636adc59410f",
  "status": "onsale",
  "shipping_fee": 199,
  "shipping_fee": 9,
  "shipping_paid_by": "seller",
  "shipping_from_state": "CA",
  "shipping_from_address_id": "1396d9a6-af4e-11e5-99e6-3c15c2c2663e",
  "shipping_from_address": { "street1": "123 main st", "city": "gotham", "zip": "012345", "state": "CA" },
  "shipping_within_days": 1,
  "photo": {
    "d4a011d2-2523-4db4-91b1-2fe65d5ed4f8": {
      "status": "active",
      "display_order": 2,
      "view_url": "https://s3.amazonaws.com/api/v1/listing-photo/13086deb-aa83-4baf-8cd5-17c99bd3e2e8/d4a011d2-2523-4db4-91b1-2fe65d5ed4f8"
    },
    "e4a011d2-2523-4db4-91b1-2fe65d5ed4f8": {
      "status": "pending",
      "display_order": 1,
      "view_url": "https://s3.amazonaws.com/api/v1/listing-photo/13086deb-aa83-4baf-8cd5-17c99bd3e2e8/e4a011d2-2523-4db4-91b1-2fe65d5ed4f8"
    },
    "33a011d2-2523-4db4-91b1-2fe65d5ed4f8": {
      "status": "active",
      "view_url": "https://s3.amazonaws.com/api/v1/listing-photo/13086deb-aa83-4baf-8cd5-17c99bd3e2e8/33a011d2-2523-4db4-91b1-2fe65d5ed4f8"
    }
  },
  "cover_photo": "33a011d2-2523-4db4-91b1-2fe65d5ed4f8"
}
```


Field                | Type   | Mutable |  Description
---------------------|--------|---------|---------------
id                   | string | no      | Unique id of the listing
name                 | string | yes     | Name of the item / title of the game
description          | string | yes     | Long description
category             | string | yes     | enum: games, console, accessory
platform             | string | yes     | enum: ps1, ps2, ps3, ps4, wii, xbox, wiiu, xbox360, xboxone
genre                | array  | yes     | array of strings for game genre.
owner                | string | no      | listing owner id.
condition            | string | yes     | enum: poor, fair, good, very good, like new, refurbished, new
price                | number | yes     | cost of the item in cents USD
upc                  | string | yes     | UPC code for the item. opaque code used as key to product catalog
commission           | number | yes     | commission
digital              | boolean| yes     | indicate the listing is digital if set to true
digital_fee          | number | yes     | similar to commission, but extra fee for digital listing
digital_region       | string | yes     | region limitation for digital goods
digital_deliverable  | string | yes     | digital code, in-game item, etc.
cover_photo          | string | yes     | the photo id key of the photo hash to be used as the listings cover photo
photo                | hash   | no      | A hash of key=id, value="photo meta-data" of photos attached to the listing.
status               | string | yes     | enum: prepare, ready, onsale, sold, cancelled
shipping_fee         | number | yes     | shipping cost in cents USD
shipping_weight      | number | yes     | shipping weight in Oz
shipping_paid_by     | string | yes     | enum: buyer, seller
shipping_from_state  | string | yes     | deprecated -- use shipping_from_address
shipping_from_address_id | string | yes | id from profile address book of shipping_from_address
shipping_from_address| hash   | no      | address object (from profile address book) describing where the items will be shipped from. Used for computing shipping cost estimates.
shipping_within_days | number | yes     | maximum number of days after purchase the item will be shipped
shipping_predefined_package | string | yes | 'None', 'Letter', or 'Parcel': unset is equivalent to 'Parcel' for old clients which set shipping_fee=300 explicitly
tags                 | array  | yes     | client-managed strings (case sensitive) used for search filters
comment              | number | yes     | total count of comments on listing
created              | string | no      | RFC3339 string 'YYYY-MM-DDThh:mm:ss.dddZ'
updated              | string | no      | RFC3339 string 'YYYY-MM-DDThh:mm:ss.dddZ'
expiration           | string | no      | RFC3339 string 'YYYY-MM-DDThh:mm:ss.dddZ'
version              | number | no      | current version of object: incremented on update


Listing Photo


Field                | Type   | Mutable |  Description
---------------------|--------|---------|--------------
status               | string | yes     | enum: pending, active, deleted
display_order        | number | yes     | client managed value to support ordering of photos in a listing
view_url             | string | no      | URL client should use to retrieve the photo. Will often be a CDN with different domain from listing service endpoint

Physical (digital=false)
- manual shipping (shipping_predefined_package=None)
- $1 shipping (shipping_predefined_package=Letter)
- $3 shipping (shipping_predefined_package=Parcel)

Digital (digital=true)
- Non-skin (category!=DIGITAL_INGAME)
   - Coordinated transfer (digital_deliverable=transfer)
   - Code (digital_deliverable=code)
     - Auto-delivery (shipping_within_days=0)
     - Manual-delivery (shipping_within_days>0)
- Skin (category=DIGITAL_INGAME)
   - Coordinated transfer (digital_deliverable=transfer)
   - Bot trade (digital_deliverable=code)

