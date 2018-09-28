# Wallet

## Terms
* Cash (real cash): hard currency
* Gbux (Gameflip bucks): internal currency (non-transferrable, does not expire)
* Bonus (bonus cash, or incentive credit)
* Flp: FLP deposit or from sale proceeds
* Gflp: FLP from conversion
* Bonus Flp: Bonus (incentive) FLP given from promotions or contests
* Cash withhold: amount withheld but not withdrawn from cash balance
* Gbux withhold: amount withheld but not withdrawn from cash balance
* Bonus withhold: amount withheld but not withdrawn from bonus
* Transaction: an entry for fund withdraw or deposit

## Required behaviors
* balance: get total wallet balance, including cash and bonus and different currencies
* available_balance: get total wallet balance, including cash and bonus, less withholds
* cash_balance: total/available/withhold
* gbux_balance: total/available/withhold
* bonus_balance: total/available/withhold
* flp_balance: total/available/withhold
* gflp_balance: total/available/withhold
* debit (withdraw)
* credit (deposit)

## Wallet

### cash table

property            | type / key         | note
--------------------|--------------------|--------
owner               | uuid, primary key  |
balance             | integer            |
pending_transaction | hash { transaction_id: amount } |
updated             | timestamp          |
version             | integer            |

### gbux table

property            | type / key         | note
--------------------|--------------------|--------
owner               | uuid, primary key  |
balance             | integer            |
pending_transaction | hash { transaction_id: amount } |
updated             | timestamp          |
version             | integer            |

### bonus table

property            | type / key         | note
--------------------|--------------------|--------
owner               | uuid, primary key  |
bonus_id            | uuid, range key    |
amount_awarded      | integer            |
amount_available    | integer            |
pending_transaction | hash { transaction_id: amount } |
usage               | hash { transaction_id: amount } |
expiration          | timestamp          |
created             | timestamp          |
updated             | timestamp          |
version             | integer            |

### transaction table

property            | type / key / note
--------------------|-------------------
id                  | uuid, primary key
owner               | uuid (global secondary index)
ref_id              | source of transaction, e.g. charge, cash-out
ref_type            | 'charge', 'credit', 'cash-out'
fund_flow           | 'credit' or 'debit'
cash_available      | integer
gbux_available      | inteter
bonus_available     | integer
flp_available       | integer
gflp_available      | integer
cash_amount         | integer
gbux_amount         | integer
bonus_amount        | integer
flp_amount          | integer
gflp_amount         | integer
bonus_flp_amount    | integer
bonus_usage         | hash { bonus_id: amount }
description         | string
created             | timestamp

## Procedure

### debit

1. get cash_balance, gbux_balance, and bonus balance (see computing bonus balance)
2. if the total available balance is not enough, use credit card charge the deficit.
and then reduce the debit amount to available balance 
(completion of analysis step)

3. use bonus first, gbux second, and then cash
4. manufacture transaction id, add pending transactions to bonus and cash entries (conditional update)
5. save transaction entry 
(completion of auth step)

6. deduct the amount from bonus, gbux, and cash entries.
reduce fund amount and remove pending transaction hash-entry in one atomic write 
(conditional update with version and expected amount)
6.1 idempotent debit
if pending transaction entry is not in the bonus/gbux/cash entry, the amount has been deducted and no further action
(completion of reconcile step)

#### error condition
1. partial failure at auth step
if only pending_transaction id made into only some of the cash/gbux/bonus entries or all pending_transaction are recorded
but the transaction record fails to save, some or all funds will not be available.
> remedy
when get detailed balance view (available_balance), verify pending_transaction properties have a corresponding transaction record

2. partial failure at reconcile step
execute reconcile step again. it is guarded by idempotent behavior (presence of corresponding pending transaction property)

### credit to cash
1. manufacture transaction id, add pending transactions to cash entry (conditional update)
2. save transaction entry 
(completion of auth step)

3. credit the amount to cash entry.
increase the amount and remove the pending transaction hash-entry in one atomic write
(conditional update with version and expected amount)
3.1 idempotent credit
if pending transaction entry is not in the cash entry, the amount has been credited and no further action
(completion of reconcile step)

### credit to gbux
1. manufacture transaction id, add pending transactions to gbux entry (conditional update)
2. save transaction entry 
(completion of auth step)

3. credit the amount to gbux entry.
increase the amount and remove the pending transaction hash-entry in one atomic write
(conditional update with version and expected amount)
3.1 idempotent credit
if pending transaction entry is not in the gbux entry, the amount has been credited and no further action
(completion of reconcile step)

#### error condition
solution is similar to error conditions in debit procedure

### credit to bonus
Just add it to the table. the record itself works as a single transaction

#### cash_balance
directly from cash entry, pending transaction amount listed separately as withhold amount

#### held_cash_balance
proceeds from sale held until specific date

#### gbux_balance
directly from gbux entry, pending transaction amount listed separately as withhold amount

#### bonus balance
1. retrieve not-yet-expired entry
2. add all bonus amount as bonus balance
3. add all pending transactions as withhold amount
4. (optional) sort by expiration date for debit procedure

### balance
cash balance + gbux balance + bonus balance without subtracting withhold amount

## Reserved design

property            | type / key         | note
--------------------|--------------------|--------
owner               | uuid, primary key  |
balance             | integer            |
pending_transaction | hash { transaction_id: amount } |
bonus_balance       | integer            | cached bonus balance
bonus_updated       | timestamp          | date-time when bonus balance updated
bonus_expiration    | timestamp          | the earliest expiration time among bonus entries (compare with re-compute time calculated by code)
updated             | timestamp          |
version             | integer            |
