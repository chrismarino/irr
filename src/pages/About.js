import React from 'react';
import Layout from "../components/Layout";

function About() {
  return (
    <Layout>

      <div style={{ width: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginLeft: '100px', alignItems: 'center'}}>
          <h3>More information about Rocket Returns: <a href="https://github.com/chrismarino/rocketreturns/blob/main/About.md" style={{ color: '#72d5fa' }}> here</a></h3>
          <h1 id="rocket-pool-node-and-minipool-irr-calculator">Rocket Pool Node and Minipool IRR Calculator</h1>
          <p>An app that calculates the IRR of a Ethereum validator node running the <a href="https://rocketpool.net/" style={{ color: '#72d5fa' }}>Rocket Pool</a> Liquid Staking Protocol.</p>
          <p>Enter your Rocket Pool node address and the app will calculate the internal rate of return (IRR) based on the rewards earned. </p>
          <p>The IRR is based on the timing and value of the flows of:</p>
          <ol>
            <li>Deposits and withdrawals to the node wallet </li>
            <li>Minipool creation and exits</li>
            <li>RPL staking </li>
            <li>Claimed and unclaimed periodic reward, </li>
            <li>Distributed and undistributed continious rewards</li>
          </ol>
          <p>For each of these events, it tracks the amount transfered as well as the price of the asset on that date. With this data the app calculates a number of finacial performance metrics, including the fiat value of claimed and unclaimed rewards, distributed and undistributed rewards, the IRR of the reward flows as well as the overall IRR of the node, for both Ethereum and RPL.</p>
          <p>These values are calculated for the node in native Etherum and RPL, as well as in fiat currency (USD). The IRR calculations use the token price on the day of the event to calculate the fiat value of the event. Price for the day is the midpoint between the high and low for the day as provided by the pubic <a href="https://www.coinbase.com/cloud" style={{ color: '#72d5fa' }}>coinbase</a> pricing API. The fiat IRR is then calculated using the values of the fiat flows.</p>
          <p>Individual Minipool performance is calculated in a similar manner. Node Smoothing Pool and RPL inflation rewards are allocated to the minipools in a time weighter maner to determine the overall performance of each minipool. </p>
          <h2 id="node-performance-metrics">Node Performance Metrics</h2>
          <p>The app calculates the following metrics for the node:</p>
          <ul>
            <li>Current Price: Current price of Eth and RPL in USD</li>
            <li>Total Deposited: Total Eth deposited to the node wallet.</li>
            <li>Total Withdrawn: Total Eth withdrawn from the node wallet.</li>
            <li>Minipool Bonds/Staked: Total Eth deposited to Minipools. Considered as wallet withdrawals for IRR calculations.</li>
            <li>Total Fees: Total Eth fees paid by the node. Calculated as the difference between the total net deposits and the total minipool bonds.</li>
            <li>Wallet Balance: Current balance of the node wallet.</li>
            <li>Return of Capital: For exited Minipools, the Eth bond returned to the node wallet.</li>
            <li>Distributed Continuous Rewards: Total Continuous Rewards distributed to the nodes withdrawal address. All unclaimed rewards for exited Minipools are automatically distributed.</li>
            <li>Undistributed Continuous Rewards: Total Continuous Rewards earned but not yet distributed. Includes an estimate of for current ongoing rewards interval.</li>
            <li>Total Continuous Rewards: Total claimed and unclaimed rewards for the node over its life.</li>
            <li>Total Continuous Rewards IRR: IRR of Continuous Rewards Eth. </li>
            <li>Claimed Periodic Rewards: Total claimed Periodic Rewards sent to the nodes withdrawal address.</li>
            <li>Unclaimed Periodic Rewards: Total unclaimed Periodic Rewards earned by the node. Includes an estimate of for current ongoing rewards interval.</li>
            <li>Total Periodic Rewards: Total claimed and unclaimed rewards for the node over its life.</li>
            <li>Total Periodic Rewards IRR: IRR of Periodic Rewards Eth.</li>
            <li>Total Reward Earned: Total earned and unclaimed/undistributed Continuous and Periodic rewards.</li>
            <li>Node Total Balance: Total balance of the node. Includes all Eth deposits, rewards and fees.</li>
            <li>Node Total Gain:</li>
            <li>Node IRR:</li>
          </ul>
          <h2 id="minipool-performance-metrics">Minipool Performance Metrics</h2>
          <p>The app calculates the following metrics for each minipool:</p>
          <ul>
            <li>Minipool: Minipool Index.</li>
            <li>Activated: Date Minipool began attesting. </li>
            <li>Status: Minipool Status. Active or Exited.</li>
            <li>Exited: Date a Minipool Exited. The end date for price and IRR calculations for exited Minipools.</li>
            <li>Age: Age of Minipool in days. Exited Minipools stop aging on their exit date.</li>
            <li>Eth Deposits: Eth bond deposited to Minipool (i.e. LEB8 or LEB16),</li>
            <li>Eth Returned: Eth bond returned by exiting Minipool. </li>
            <li>Distributed Continuous Rewards: Continuous Rewards distributed from Minipool. All unclaimed rewards for exited Minipools are automatically distributed.</li>
            <li>Undistributed Continuous Rewards: Continuous Rewards earned but not yet distributed. Includes an estimate of for current ongoing rewards interval.</li>
            <li>Total Continuous Rewards: Total claimed and unclaimed rewards for the Minipool over its life.</li>
            <li>Continuous Rewards IRR: IRR of Continuous Rewards Eth. Fiat IRR is not calculated for Continuous Rewards.</li>
            <li>Claimed Smoothing Pool Rewards: Allocated share of node&#39;s claimed Smoothing Pool rewards to Minipool. Based on the daily weighed average of Minipool bond and total bond across all active Minipools during a rewards interval.</li>
            <li>Unclaimed Smoothing Pool Rewards: Allocated share of node&#39;s unclaimed Smoothing Pool rewards to Minipool. Based on the daily weighed average of Minipool bond and total bond across all active Minipools during the interval.</li>
            <li>Total Smoothing Pool Rewards: Total claimed and unclaimed Smooting Pool rewards to Minipool over its life.</li>
            <li>Smoothing Pool IRR: IRR of Smooting Pool Rewards Eth allocated to Minipool. IRR based on flows of all Smoothing Pool Rewards Eth earned by this Minipool over life of Minipool. Fiat IRR is not calculated for Smoothing Pool Rewards.</li>
            <li>Total Eth Rewards: Total Eth earned by this Minipool. Includes all Continuous and Smoothing Pool Eth rewards.</li>
            <li>Claimed RPL Inflation: Allocated share of claimed RPL Inflation rewards to Minipool. Based on daily weighed average of Minipool bond and total bond across all active Minipools during the interval.</li>
            <li>Unclaimed RPL Inflation: Allocated share of unclaimed RPL Inflation rewards to Minipool. Based on daily weighed average of Minipool bond and total bond across all active Minipools during the interval.</li>
            <li>Total RPL Inflation: Total RPL Inflation rewards to Minipool over its life. Sum of claimed and unclaimed RPL Inflation rewards.</li>
            <li>RPL Inflation IRR: IRR of RPL Inflation rewards. Uses current price of RPL for Active Minipools, price on date of exit for Exited Minipools.</li>
            <li>Total Minipool Gain: Total gain of this Minipool. For native tokens this is the same as Total Eth Rewards. For fiat currency it also includes change in token price.</li>
            <li>Eth Total IRR: IRR of all Eth earned by this Minipool. </li>
          </ul>
          <h2 id="periodic-rewards">Periodic Rewards</h2>
          <p>The Periodic Rewards tab shows the rewards earned by the node for each interval. The Smoothing Pool Eth and RPL Inflation rewards are allocated across the node&#39;s Minipool based on the time-weighted days the Minipool was active during the interval. IRR of Periodic Rewards is an estimate based total interval rewards. Timing of claimed and unclaimed rewards is captured in total Minipool and Node IRRs.</p>
          <p>The table show</p>
          <ul>
            <li>Interval: The rewards interval.</li>
            <li>Ended: The end date of the interval.</li>
            <li>Claimed: Status of the rewards. Claimed or Unclaimed.</li>
            <li>Smoothing Pool: Total Eth rewards earned in the interval.</li>
            <li>Inflation: Total RPL rewards earned in the interval.</li>
          </ul>
          <h3 id="rpl-top-off">RPL Top Off</h3>
          <p>A table that shows the RPL Top Off events for the node. To do.</p>

        </div>
      </div>
    </Layout>
  );
}

export default About;