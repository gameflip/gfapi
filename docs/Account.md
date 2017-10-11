## Service: Account

Service                                   | Method | Documentation
------------------------------------------|--------|--------------
/api/v1/account/me/wallet_history         | GET    | [GET /api/v1/account/me/wallet_history](#get-apiv1accountmewallet_history)

### GET /api/v1/account/me/wallet_history

Get your [**wallet**](Wallet.md) balance and history.

*GET with year_month parameter:*
year_month in YYYY-MM, e.g. 2015-03. 
If year_month is not provided, it is current month (UTC)

**query options**
* **balance_only** if provided, does not return wallet history
* **pending** if provided, return pending ledger_ids and amounts.
* **held** if provided, return held ledger_ids, held_until, and amounts.

For a light-weight operation that requires balance only, use the parameter 'balance_only'
**sample request**

```http
GET /api/v1/account/me/wallet_history?balance_only HTTP/1.1
Authorization: GFAPI <apikey>:<totp>
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Length: 167
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "owner": "us-fake-1:abcdef01-2345-6789-a0b4-8b263c7ac0d1",
    "balance": 99169,
    "cash_balance": 399,
    "gbux_balance": 98770,
    "bonus_balance": 0,
    "held_cash_balance": 450
  }
}
```

**sample request**

Here is a sample that gets the wallet, pending transactions, and history.

```http
GET /api/v1/account/me/wallet_history?year_month=2015-03&pending&held HTTP/1.1
Authorization: GFAPI <apikey>:<totp>
```

**sample response**

```http
HTTP/1.1 200 OK
Content-Length: 1659
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "owner": "us-fake-1:abcdef01-2345-6789-a0b4-8b263c7ac0d1",
    "balance": 99169,
    "cash_balance": 399,
    "gbux_balance": 98770,
    "bonus_balance": 0,
    "held_cash_balance": 450,
    "pending": {
    },
    "held": {
        "cc2e9958-2668-445a-a065-6eb36f9dc72f": {
          "held_until": "2017-05-07T02:39:37.874Z",
          "amount": 450
      }
    },
    "history": [
      {
        "id": "ce7ebbaf-0efe-4027-8ab0-2d83ed81edbc",
        "owner": "us-fake-1:abcdef01-2345-6789-a0b4-8b263c7ac0d1",
        "ledger_type": "debit_exchange",
        "ref_id": "04da7c1e-2bc2-41d8-ac18-413ed929078c",
        "ref_type": "exchange",
        "fund_flow": "debit",
        "cash_available": 399,
        "gbux_available": 96270,
        "bonus_available": 0,
        "cash_amount": 0,
        "gbux_amount": 1000,
        "bonus_amount": 0,
        "charge_amount": 0,
        "shipping_fee": 0,
        "processing_fee": 0,
        "digital_fee": 0,
        "commission": 0,
        "withdraw_fee": 0,
        "bonus_usage": {
        },
        "description": "exchange 04da7c1e-2bc2-41d8-ac18-413ed929078c: buy listing c4507186-28c0-41f7-b654-4d96626fab85",
        "created": "2017-05-06T00:30:26.309Z",
        "cal_date": "2017-05-06",
        "owner_month": "us-fake-1:abcdef01-2345-6789-a0b4-8b263c7ac0d1:2017-05"
      },
      {
        "id": "82447a02-d881-436b-82e3-54953f9145e6",
        "owner": "us-fake-1:abcdef01-2345-6789-a0b4-8b263c7ac0d1",
        "ledger_type": "debit_reversal",
        "ref_id": "0246d1f0-a434-4639-82d2-568298f1624a",
        "ref_type": "exchange",
        "fund_flow": "credit",
        "origin_ledger_id": "0d55b517-787a-487e-b290-365131587aa0",
        "cash_available": 399,
        "gbux_available": 95806,
        "bonus_available": 0,
        "cash_amount": 0,
        "gbux_amount": 156,
        "bonus_amount": 0,
        "charge_amount": 0,
        "shipping_fee": 0,
        "processing_fee": 0,
        "digital_fee": 0,
        "commission": 0,
        "withdraw_fee": 0,
        "bonus_usage": {
        },
        "description": " rescinded - exchange 0246d1f0-a434-4639-82d2-568298f1624a: buy listing 3f5bed29-8367-4a74-95eb-d673436128d1",
        "created": "2017-05-04T20:20:28.980Z",
        "cal_date": "2017-05-04",
        "owner_month": "us-fake-1:abcdef01-2345-6789-a0b4-8b263c7ac0d1:2017-05"
      }
    ]
  }
}
```

**ledger_type**
1. credit_bonus: user awarded bonus
2. credit_exchange: seller receives sale proceeds
3. debit_exchange: buyer spends to buy listing
4. debit_withdraw: user transfer money out
5. credit_reversal: reversal of previous credit (a debit entry, not used yet)
6. debit_reversal: refund the money used in a listing purchase (a credit entry)
