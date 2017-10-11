## Service: Profile

Service                    | Method | Documentation
---------------------------|--------|--------------
/api/v1/account/me/profile | GET    | [GET /api/v1/account/me/profile](#get-apiv1accountmeprofile)

### GET /api/v1/account/me/profile

Get your profile.

**sample request**

```http
GET /api/v1/account/me/profile HTTP/1.1
Authorization: GFAPI <apikey>:<totp>
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "owner": "us-fake-1:6209aa43-0a27-4bf8-930e-ab00ab11c7fa",
    "display_name": "joker",
    "first_name": "Jack",
    "last_name": "Napier",
    "email": "joker@misadventure.org",
    "phone": "1114567890",
    "about": "Criminal mastermind",
    "avatar": "http://fc00.deviantart.net/fs71/f/2012/208/f/a/joker_painting_by_scampicrevette-d58soyl.jpg",
    "background": "http://vignette4.wikia.nocookie.net/batman/images/c/c1/AA.jpg/revision/latest?cb=20130218152233",
    "address": {
      "e271c268-c146-45c5-ac38-ca51a44ed25b": {
        "name": "Jack Napier",
        "zip": "90001",
        "street1": "276 West Main St",
        "label": "home",
        "state": "MA",
        "city": " Arkham"
      }
    },
    "default_address": "e271c268-c146-45c5-ac38-ca51a44ed25b",
    "invite_code": "F8KEE30N",
    "invited_by": "us-fake-1:9j63aa43-27a0-mdje0-333-arj44arjnar92n4",
    "rating_good": 10,
    "rating_neutral": 8,
    "rating_poor": 1,
    "buy": 5,
    "sell": 1,
    "score": 9,
    "created": "2015-04-21T02:20:38.359Z",
    "updated": "2015-04-21T02:20:38.437Z",
    "version": "1"
  }
}
```
