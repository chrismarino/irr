## Process node eth1 address.

Fetch node validator list from Beaconcha.in using eth1 address. Response includes a record for each validator. 
This should be updated whenever the Node address feild is changed on the page. Save this array as `nodeValidators`
```
{
  "status": "OK",
  "data": [
    {
      "publickey": "0x857fba79371dd06c81e9d42694ff516d9eb857fd47758e39e87fe877a26fc21e69f4e2f169869040dfc1385a19bea4a5",
      "valid_signature": true,
      "validatorindex": 810338
    },
    {
      "publickey": "0xb952fd7e5248b75bee6af536632731382efb0f475aca9125ffb25a27073cc990813f03bcdbfa8049ca128385de6087b2",
      "valid_signature": true,
      "validatorindex": 983397
    },
    {
      "publickey": "0xa9979140769d034bd7a850005c024df12159821f8ba57a51411c71373320e89b85e4162af7424ea3f9b11050cc144350",
      "valid_signature": true,
      "validatorindex": 1101573
    }
  ]
}
```
### Fetch validator stats

For each validator on the node, fetch their stats. Reponse is complete daily record of validator properties.

```
       {
            "attester_slashings": 0,
            "day": 1153,
            "day_end": "2024-01-29T12:00:23Z",
            "day_start": "2024-01-28T12:00:23Z",
            "deposits": 0,
            "deposits_amount": 0,
            "end_balance": 0,
            "end_effective_balance": 0,
            "max_balance": 0,
            "max_effective_balance": 0,
            "min_balance": 0,
            "min_effective_balance": 0,
            "missed_attestations": 0,
            "missed_blocks": 0,
            "missed_sync": 0,
            "orphaned_attestations": 0,
            "orphaned_blocks": 0,
            "orphaned_sync": 0,
            "participated_sync": 0,
            "proposed_blocks": 0,
            "proposer_slashings": 0,
            "start_balance": 0,
            "start_effective_balance": 0,
            "validatorindex": 810338,
            "withdrawals": 0,
            "withdrawals_amount": 0
        },
```
There will be hundereds of records in the response and most will not be necessary. Elimiate all the records that don't have deposts or withdrawals.
It appears that the feild to test for is `desposit_amount` !0 and `withdrawal_amount` !0
#### Filter array

The Validator array fields only need to include:
* ValidatorIndex
* Deposit
* Withdrawal
* Timestamp

#### Format arrays

For each entry, format the timestamps so that the date conforms to the requirements of irr_node

## Calculate IRR

With the processed array, calculate the IRR over the entire range to get the IRR of the node, as well as for each validator individually. The array should include

* Eth address
* ValidatorIndex
* Age
* IRR

Node IRR is a `const`


