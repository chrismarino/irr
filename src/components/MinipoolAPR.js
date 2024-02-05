import React, { useState, useEffect, useRef } from 'react';
import getValidators from "../getValidators";
import getPriceData from "../getPriceData";
import getRocketpoolValidatorStats from "../getRocketpoolValidatorStats";
import getValidatorStats from "../getValidatorStats";
import calcMinipoolAPRs from "../calcMinipoolAPRs";
let minipoolIndexArray = [];

function MinipoolAPR({ nodeAddress }) {
  const [depositsAndWithdrawals, setDepositsAndWithdrawals] = useState([]);
  const [minipools, setMinipools] = useState([]);
  const [ethPriceToday, setEthPriceToday] = useState(0);
  // Some state variables to keep track of the status of the fetches
  //const [gotEthPriceToday, setGotEthPriceToday] = useState([]); //not used since I can use the ethPriceToday object
  const [gotValidators, setGotValidators] = useState([]);
  const [gotValidatorStats, setGotValidatorStats] = useState([]);
  const [gotRocketpoolDetails, setGotRocketpoolDetails] = useState([]);
  const [gotDepositsAndWithdrawals, setGotDepositsAndWithdrawals] = useState([]);


  var validatorArray = []; // reset the validator array
  var minipoolArray = []; // reset the minipool array
  var count = 0;

  useEffect(() => {
    async function fetchEthPriceToday() {
      const ethPriceToday = await getPriceData(""); //fetch the price of eth. No date returns the current price.
      setEthPriceToday(ethPriceToday);
      //setGotEthPriceToday(true); //not used since I can use the ethPriceToday object
    }
    fetchEthPriceToday();
  }, [nodeAddress]);

  useEffect(() => {
    async function fetchValidatorArray() {
      // Fetch the list of validators indexed by the eth addresses of the node. From the list of validators, get the minipool 
      // stats for each validator. 
      if (nodeAddress === "") return; //don't run if the node address is empty
      setGotValidators(false); // will be reset, unless there is an error or empty node address
      setGotValidatorStats(false);
      setGotDepositsAndWithdrawals(false); // new node address, so reset the HasRun flags
      setGotRocketpoolDetails(false);
      if (nodeAddress === "") return;
      try {
        validatorArray = await getValidators(nodeAddress);
        minipoolIndexArray = (validatorArray || []).map(item => item.validatorindex);  //get the minipool addresses  || [])
        minipoolIndexArray = (minipoolIndexArray || []).map(item => ({
          validatorIndex: item,
          status: true  //set the status of the minipool to active
        }));  //get the minipool addresses
        setMinipools(minipoolIndexArray);
        setGotValidators(true);
        console.log("Minipool Index Array:", minipoolIndexArray);
      }
      catch (error) {
        console.log("Error creating validator index array:", error);
      }
    }
    fetchValidatorArray();
  }, [nodeAddress]);

  useEffect(() => {
    async function fetchRocketpoolValidatorStatsArray() {
      if (gotValidators === true && gotRocketpoolDetails === false) { //only run if the validator array has run, but only once.
        try {
          minipoolArray = await getRocketpoolValidatorStats(minipools); //minipools includes an array of validator indexes
          let updatedMinipoolIndexArray = minipools;
          updatedMinipoolIndexArray = (minipoolArray || []).map((item, index) => ({
            minipoolStats: item,
            validatorIndex: minipools[index].validatorIndex,
            bond: item.node_deposit_balance, //convert to eth
            status: minipools[index].status
          }));  //get the minipool addresses

          console.log("Updated Minipool Index Array with Minipool stats:", updatedMinipoolIndexArray);
          setMinipools(updatedMinipoolIndexArray);
          setGotRocketpoolDetails(true);
        }
        catch (error) {
          console.log("Error fetching Rocketpool stats:", error);
        }

      }
    }
    fetchRocketpoolValidatorStatsArray();
  }, [gotValidators]);

  useEffect(() => {
    let allDepositsAndWithdrawals = [];
    async function fetchDepositsAndWithdrawals() {
      if (gotRocketpoolDetails=== false) return; //only run if the rocketpool details have run
      console.log("Validators Has Run and Have the Rocketpool Stats. minipools:", minipools);
        for (const index of minipools) {
          try {
            const oneIndex = await getValidatorStats(index.validatorIndex);
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
              setGotValidatorStats(true)
              console.log("Minipool has exited setting minipools state to:", exitedMinipools, "Minipools:", minipools);
            }
          }
          catch (error) {
            console.log("Error creating deposit array:", error);
          }
        }
        setGotDepositsAndWithdrawals(true);
    }
    fetchDepositsAndWithdrawals();
  }, [gotRocketpoolDetails]);


  var minipoolAPRs = [];
  // only calculate the IRR when the withdrawls and deposits have been fetched

  // only render when the all the stats. withdrawls and deposits have been fetched
  if (gotDepositsAndWithdrawals) {
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
              <th>Node APR</th>
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
              <th>P APR</th>
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
              <th>NO APR</th>
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
      <p>ETH Price Now: ${ethPriceToday.eth_price_usd} RPL Price Now: ${ethPriceToday.rpl_price_usd}</p> {/* Render ethPriceToday */}

    </div>
  );
}


export default MinipoolAPR;
