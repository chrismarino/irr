

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { fetchValidatorStats, fetchValidators, fetchPriceData, fetchRocketpoolValidatorStats } from "../aprUtils.js";
import { calcMinipoolAPRs } from "../calcMinipoolAPRs.js";
let minipoolIndexArray = [];

function MinipoolAPR({ nodeAddress }) {
  const [depositsAndWithdrawals, setDepositsAndWithdrawals] = React.useState([]);
  const [minipools, setMinipools] = React.useState([]);
  const [validatorCount, setValidatorCount] = useState(0);
  const [ethPriceToday, setEthPriceToday] = React.useState(0);


  //console.log("Test payouts.data: ", payouts.data);
  const depositsAndWithdrawalsHasRun = useRef(false);
  const validatorArrayHasRun = useRef(false);
  const rocketpoolValidatorsStatsHasRun = useRef(false);
  var validatorArray = []; // reset the validator array
  var minipoolArray = []; // reset the minipool array
  var count = 0;

  useEffect(() => {
    async function fetchEthPrice() {
      const priceToday = await fetchPriceData(""); //fetch the price of eth. No date returns the current price.
      setEthPriceToday(priceToday);
    }
    fetchEthPrice();
  }, []);

  useEffect(() => {
    async function fetchValidatorArray() {
      // Fetch the list of validators indexed by the eth addresses of the node. From the list of validators, get the minipool 
      // stats for each validator. 
      validatorArrayHasRun.current = false; // will be reset, unless there is an error or empty node address
      if (nodeAddress === "") return;
      try {
        validatorArray = await fetchValidators(nodeAddress);
        depositsAndWithdrawalsHasRun.current = false // new node address, so reset the HasRun flags
        rocketpoolValidatorsStatsHasRun.current = false; 
        minipoolIndexArray = (validatorArray || []).map(item => item.validatorindex);  //get the minipool addresses  || [])
        minipoolIndexArray = (minipoolIndexArray || []).map(item => ({
          validatorIndex: item,
          status: true  //set the status of the minipool to active
        }));  //get the minipool addresses
        setMinipools(minipoolIndexArray);

        console.log("Minipool Index Array:", minipoolIndexArray);
      }
      catch (error) {
        console.log("Error creating validator index array:", error);
      }
      validatorArrayHasRun.current = true;
    }
    fetchValidatorArray();
  }, [nodeAddress]);

  useEffect(() => {
    async function fetchRocketpoolValidatorStatsArray() {
      if (validatorArrayHasRun.current === true ) { //only run if the validator array has run to set minipools
        try {
          minipoolArray = await fetchRocketpoolValidatorStats(minipools); //minipools includes an array of validator indexes
          let updatedMinipoolIndexArray = minipools;
          updatedMinipoolIndexArray = (minipoolArray || []).map((item, index) => ({
            minipoolStats: item,
            validatorIndex: minipools[index].validatorIndex,
            bond: item.node_deposit_balance, //convert to eth
            status: minipools[index].status
          }));  //get the minipool addresses

          console.log("Updated Minipool Index Array with Minipool stats:", updatedMinipoolIndexArray);
          setMinipools(updatedMinipoolIndexArray);
          console.log("Just set minipool array:", minipools);
        }
        catch (error) {
          console.log("Error fetching Rocketpool stats:", error);
        }
        rocketpoolValidatorsStatsHasRun.current = true;
      }
    }
    fetchRocketpoolValidatorStatsArray();
  }, [validatorArrayHasRun.current]);

  useEffect(() => {
    let allDepositsAndWithdrawals = [];
    async function fetchDepositsAndWithdrawals() {
      if (validatorArrayHasRun.current === false || rocketpoolValidatorsStatsHasRun === false ) return;
      console.log("Validators Has Run. minipools:", minipools);
      if (!depositsAndWithdrawalsHasRun.current && (validatorCount < minipools.length)) {
        for (const index of minipools) {
          try {
            count = validatorCount + 1; //only run till the validator count is reached
            setValidatorCount(count);
            const oneIndex = await fetchValidatorStats(index.validatorIndex);
            allDepositsAndWithdrawals = allDepositsAndWithdrawals.concat(oneIndex.nodeDepositsAndWithdrawals); //response structure is different for deposits
            setDepositsAndWithdrawals(allDepositsAndWithdrawals);
            //see if the minipool has exited. Set it to false if it has.
            if (oneIndex.status === false) {
              let exitedMinipools = minipools.map(minipool =>
                minipool === index ? {
                  ...minipool,
                  status: false
                } : minipool);
                setMinipools(exitedMinipools);
                console.log("Minipool has exited setting minipools state to:", exitedMinipools, "Minipools:", minipools);
            }

            //console.log("valudator Count:", validatorCount, "total minipools:", minipools.length);
          }
          catch (error) {
            console.log("Error creating deposit array:", error);
          }
        }
        depositsAndWithdrawalsHasRun.current = true;
      }
    }
    fetchDepositsAndWithdrawals();
  }, [validatorArrayHasRun.current]);


  var minipoolAPRs = [];
  // only calculate the IRR when the withdrawls and deposits have been fetched

  // only render when the all the stats. withdrawls and deposits have been fetched
  if (depositsAndWithdrawalsHasRun.current) {
    // render the irrs...
    if (validatorArrayHasRun.current === false || rocketpoolValidatorsStatsHasRun === false ) return;
    minipoolAPRs = calcMinipoolAPRs(minipools, depositsAndWithdrawals, ethPriceToday);
  
  }
  return (
    <div className="MinipoolAPR">
      <header className="MinipoolAPR-header">
        <h1>Minipool APRs</h1>
        </header>
        <section>
          <table>
            <thead>
              <tr>
                <th>Index</th>
                <th>Status</th>
                <th>Age</th>
                <th>Eth Deposited</th>
                <th>Eth Earned</th>
                <th>Native APR</th>
                <th>Fiat Gain</th>
                <th>Fiat APR</th>

              </tr>
            </thead>
            <tbody>
              {
                (minipoolAPRs.minipoolAPRs || []).map((item, index) => (
                  <tr key={index}>
                    <td> {item.minipool} </td>
                    <td> {item.status ? 'Active' : 'Exited'} </td>
                    <td> {item.age} days </td>
                    <td> {item.eth_deposited} </td>
                    <td> {item.eth_earned} Eth Earned </td>
                    <td> {item.eth_apr}%</td>
                    <td> {item.fiat_gain}</td>
                    <td> {item.fiat_apr}%</td>

                  </tr>
                ))
              }
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th>Index</th>
                <th>Status</th>
                <th>Age</th>
                <th>Eth Deposited</th>
                <th>P Eth Earned</th>
                <th>P Native APR</th>
                <th>P Fiat Gain</th>
                <th>P Fiat APR</th>
              </tr>
            </thead>
            <tbody>
              {
                (minipoolAPRs.minipoolAPRs || []).map((item, index) => (
                  <tr key={index}>
                    <td> {item.minipool} </td>
                    <td> {item.status ? 'Active' : 'Exited'} </td>
                    <td> {item.age} days </td>
                    <td> {item.p_eth_deposited} </td>
                    <td> {item.p_eth_earned} </td>
                    <td> {item.p_eth_apr}%</td>
                    <td> {item.p_fiat_gain}</td>
                    <td> {item.p_fiat_apr}%</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th>Index</th>
                <th>Status</th>
                <th>Age</th>
                <th>Eth Deposited</th>
                <th>NO Eth Earned</th>
                <th>NO Native APR</th>
                <th>NO Fiat Gain</th>
                <th>NO Fiat APR</th>

              </tr>
            </thead>
            <tbody>
              {
                (minipoolAPRs.minipoolAPRs || []).map((item, index) => (
                  <tr key={index}>
                    <td> {item.minipool} </td>
                    <td> {item.status ? 'Active' : 'Exited'} </td>
                    <td> {item.age} days </td>
                    <td> {item.no_eth_deposited} </td>
                    <td> {item.no_eth_earned} </td>
                    <td> {item.no_eth_apr}%</td>
                    <td> {item.no_fiat_gain}</td>
                    <td> {item.no_fiat_apr}%</td>

                  </tr>
                ))
              }
            </tbody>
          </table>
        </section>
        <p>ETH Price Now: ${ethPriceToday.eth_price_usd} RPL Price Now: ${ ethPriceToday.rpl_price_usd}</p> {/* Render ethPriceToday */}

    </div>
  );
}


export default MinipoolAPR;
