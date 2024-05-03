# Rocket Pool Node and Minipool IRR Calculator

An app that calculates the IRR of a Ethereum validator node running the [Rocket Pool](https://rocketpool.net/) Liquid Staking Protocol.

Enter your Rocket Pool node address and the app will calculate the internal rate of return (IRR) based on the rewards earned. 

The IRR is based on the timing and value of the flows of:
1. Deposits and withdrawals to the node wallet 
2. Minipool creation and exits
3. RPL staking 
4. Claimed and unclaimed periodic reward, 
5. Distributed and undistributed continious rewards

For each of these events, it tracks the amount transfered as well as the price of the asset on that date. With this data the app calculates a number of finacial performance metrics, including the value of claimed and unclaimed periodic rewards, distributed and undistributed continuous rewards, the IRR of the reward flows as well as the overall IRR of the node, for both Ethereum and RPL.

These values are calculated for the node in native Etherum and RPL, as well as in fiat currency (USD). The IRR calculations use the token price on the day of the event to calculate the fiat value of the event. Price for the day is the midpoint between the high and low for the day as provided by the pubic [coinbase](https://www.coinbase.com/cloud) pricing API. The fiat IRR is then calculated using the values of the fiat flows.

Individual Minipool performance is calculated in a similar manner. Node Smoothing Pool and RPL inflation rewards are allocated to the minipools in a time-weighted maner to determine the overall performance of each minipool. 

## Node Performance Metrics

The app calculates the following metrics for the node:

* **Current Price**: Current price of Eth and RPL in USD
* *Total Deposited*: Total Eth deposited to the node wallet.
* *Total Withdrawn*: Total Eth withdrawn from the node wallet.
* *Minipool Bonds/Staked*: Total Eth and RPL withdrawn from wallet for Minipool bonds or Staked RPL. Considered as wallet withdrawals for IRR calculations.
* *Total Fees*: Total Eth fees paid by the node. Calculated as the difference between the total net deposits and the total minipool bonds.
* *Wallet Balance*: Current balance of the node wallet.
* *Return of Capital*: For exited Minipools, the Eth bond returned to the withdrawal address.
* *Distributed Continuous Rewards*: Total Continuous Rewards distributed to the node's withdrawal address. Undistrinuted Continuous Rewards for exited Minipools are automatically distributed.
* *Undistributed Continuous Rewards*: Total Continuous Rewards earned but not yet distributed. 
* *Total Continuous Rewards*: Total distributed and undistributed Continuous Rewards for the node over its life.
* *Total Continuous Rewards IRR*: IRR of Continuous Rewards Eth. 
* *Claimed Periodic Rewards*: Total claimed Periodic Rewards sent to the nodes withdrawal address.
* *Unclaimed Periodic Rewards*: Total unclaimed Periodic Rewards earned by the node. Includes an estimate of for current ongoing rewards interval.
* *Total Periodic Rewards*: Total claimed and unclaimed rewards for the node over its life.
* *Total Periodic Rewards IRR*: IRR of Periodic Rewards Eth.
* *Total Reward Earned*: Total earned and unclaimed/undistributed Continuous and Periodic rewards.
* *Node Total Balance*: Total balance of the node. Includes all Eth deposits, rewards and fees.
* *Node Total Gain:
* *Node IRR:

## Minipool Performance Metrics

The app calculates the following metrics for each minipool:

* *Minipool*: Minipool Index.
* *Activated*: Date Minipool began attesting. 
* *Status*: Minipool Status. Active or Exited.
* *Exited*: Date a Minipool Exited. The end date for price and IRR calculations for exited Minipools.
* *Age*: Age of Minipool in days. Exited Minipools stop aging on their exit date.
* *Eth Deposits*: Eth bond deposited to Minipool (i.e. LEB8 or LEB16),
* *Eth Returned*: Eth bond returned by exiting Minipool. 
* *Distributed Continuous Rewards*: Continuous Rewards distributed from Minipool. All unclaimed rewards for exited Minipools are automatically distributed.
* *Undistributed Continuous Rewards*: Continuous Rewards earned but not yet distributed. Includes an estimate of for current ongoing rewards interval.
* *Total Continuous Rewards*: Total claimed and unclaimed rewards for the Minipool over its life.
* *Continuous Rewards IRR*: IRR of Continuous Rewards Eth. Fiat IRR is not calculated for Continuous Rewards.
* *Claimed Smoothing Pool Rewards*: Allocated share of node's claimed Smoothing Pool Eth rewards to Minipool. Based on the daily weighed average of Minipool bond and total bond across all active Minipools during a rewards interval.
* *Unclaimed Smoothing Pool Rewards*: Allocated share of node's unclaimed Smoothing Pool Eth rewards to Minipool. Based on the daily weighed average of Minipool bond and total bond across all active Minipools during the interval.
* *Total Smoothing Pool Rewards*: Total claimed and unclaimed Smooting Pool Eth rewards to Minipool over its life.
* *Smoothing Pool IRR*: IRR of Smooting Pool Rewards Eth allocated to Minipool. IRR based on flows of all Smoothing Pool Rewards Eth earned by this Minipool over life of Minipool. Fiat IRR is not calculated for Smoothing Pool Rewards.
* *Total Eth Rewards*: Total Eth earned by this Minipool. Includes all Continuous and Smoothing Pool Eth rewards.
* *Claimed RPL Inflation*: Allocated share of claimed RPL Inflation rewards to Minipool. Based on daily weighed average of Minipool bond and total bond across all active Minipools during the interval.
* *Unclaimed RPL Inflation*: Allocated share of unclaimed RPL Inflation rewards to Minipool. Based on daily weighed average of Minipool bond and total bond across all active Minipools during the interval.
* *Total RPL Inflation*: Total RPL Inflation rewards to Minipool over its life. Sum of claimed and unclaimed RPL Inflation rewards.
* *RPL Inflation IRR*: IRR of RPL Inflation rewards. Uses current price of RPL for Active Minipools, price on date of exit for Exited Minipools.
* *Total Minipool Gain*: Total gain of this Minipool. For native tokens this is the same as Total Eth Rewards. For fiat currency it also includes change in token price.
* *Eth Total IRR*: IRR of all Eth earned by this Minipool. 


## Periodic Rewards

The Periodic Rewards tab shows the rewards earned by the node for each interval. The Smoothing Pool Eth and RPL Inflation rewards are allocated across the node's Minipool based on the time-weighted days the Minipool was active during the interval. IRR of Periodic Rewards is an estimate based total interval rewards. Timing of claimed and unclaimed rewards is captured in total Minipool and Node IRRs.

The table show

* *Interval*: The rewards interval.
* *Ended*: The end date of the interval.
* *Claimed*: Status of the rewards. Claimed or Unclaimed.
* *Smoothing Pool*: Total Eth rewards earned in the interval.
* *Inflation*: Total RPL rewards earned in the interval.

### RPL Top Off

A table that shows the RPL Top Off events for the node. To do.