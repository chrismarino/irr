import React, { useState, useEffect } from 'react';
import getValidators from "../getValidators";
import getPriceData from "../getPriceData";
//import getPriceDataFromCoinbase from "../getPriceDataFromCoinbase";
import getRocketpoolValidatorStats from "../getRocketpoolValidatorStats";
import getValidatorStats from "../getValidatorStats";
import calcMinipoolAPRs from "../calcMinipoolAPRs";
import NodeAPRGrid from "./NodeAPRGrid";
let minipoolIndexArray = [];

function MinipoolAPR({ nodeAddress }) {

  const [depositsAndWithdrawals, setDepositsAndWithdrawals] = useState([]);
  const [minipools, setMinipools] = useState([]);
  const [ethPriceToday, setEthPriceToday] = useState([]);
  const [ethPriceHistory, setEthPriceHistory] = useState([]);
  const [nodeAPRs, setNodeAPRs] = useState([]);
  // Some state variables to keep track of the status of the fetches
  const [gotValidators, setGotValidators] = useState(false);
  const [gotEthPriceToday, setGotEthPriceToday] = useState(false);
  const [gotEthPriceHistory, setGotEthPriceHistory] = useState(false);
  const [gotValidatorStats, setGotValidatorStats] = useState(false);
  const [gotRocketpoolDetails, setGotRocketpoolDetails] = useState(false);
  const [gotDepositsAndWithdrawals, setGotDepositsAndWithdrawals] = useState(false);


  var validatorArray = []; // reset the validator array
  var minipoolArray = []; // reset the minipool array



  useEffect(() => {
    async function fetchEthPriceToday() {
      let today = new Date();
      let formattedDate = today.toISOString().split('T')[0];
      //date must be in the format of YYYY-MM-DD for getPriceData
      let dateArray = [formattedDate];
      const ethPriceToday = await getPriceData(dateArray); //fetch the price of eth. No date returns the current price.
      setEthPriceToday(ethPriceToday);
      setGotEthPriceToday(true);
    }
    fetchEthPriceToday();
  }, [nodeAddress]);

  useEffect(() => {
    async function fetchValidatorArray() {
      // Fetch the list of validators indexed by the eth addresses of the node. From the list of validators, get the minipool 
      // stats for each validator. 
      if (nodeAddress === "") return; //don't run if the node address is empty
      setMinipools([]); //reset the minipools
      setGotValidators(false); // will be reset, unless there is an error or empty node address
      setGotValidatorStats(false);
      setDepositsAndWithdrawals([]);
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
        console.log("Minipool Index Array set from fetchValidator Array:", minipoolIndexArray);
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
      if (gotRocketpoolDetails === false) return; //only run if the rocketpool details have run
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
          }
          setGotValidatorStats(true)
        }
        catch (error) {
          console.log("Error creating deposit array:", error);
        }
      }
      setGotDepositsAndWithdrawals(true);
      console.log("All Depostis and Withdrawals set from fetchDepositsAndWithdrawals", allDepositsAndWithdrawals)
    }
    fetchDepositsAndWithdrawals();
  }, [gotRocketpoolDetails]);

  useEffect(() => {
    async function fetchEthPriceHistory() {
      if (!depositsAndWithdrawals || gotDepositsAndWithdrawals === false) return; //don't run if the deposits and withdrawals are empty
      const filteredArray = depositsAndWithdrawals.filter(item =>
        item.deposits_amount === 32000000000 || item.withdrawals_amount === 32000000000);
      let dateArray = filteredArray.map(item => {
        let date = new Date(item.date);
        let day = ('0' + date.getDate()).slice(-2);
        let month = ('0' + (date.getMonth() + 1)).slice(-2);
        let year = date.getFullYear();
        return year + '-' + month + '-' + day;
      });
      try {
        const newEthPriceHistory = await getPriceData(dateArray); //fetch the price of eth. No date returns the current price.
        setEthPriceHistory(newEthPriceHistory);
        setGotEthPriceHistory(true);
      } catch (error) {
        console.error("Error setting price history array:", error);
      }

    }
    fetchEthPriceHistory();
  }, [gotDepositsAndWithdrawals]);

  // only calculate the IRR when the withdrawls and deposits have been fetched
  // only render when the all the stats. withdrawls and deposits have been fetched

  useEffect(() => {
    console.log("gotDepostsAndWithdrawals:", gotDepositsAndWithdrawals, "gotValidatorStats:", gotValidatorStats, "gotEthPriceToday:", gotEthPriceToday, "gotEthPriceHistory:", gotEthPriceHistory)
    if (gotDepositsAndWithdrawals && gotValidatorStats && gotEthPriceToday && gotEthPriceHistory) {
      const calculatedNodeAPRs = calcMinipoolAPRs(minipools, depositsAndWithdrawals, ethPriceToday, ethPriceHistory);
      setNodeAPRs(calculatedNodeAPRs);
      console.log("NodeAPRs set from calcMinipoolAPRs:", nodeAPRs);
    }
  }, [gotDepositsAndWithdrawals, gotValidatorStats, gotEthPriceToday, gotEthPriceHistory]);

  return (
    <div className="MinipoolAPR">
      <section>

        {/* <p>ETH Price Now: ${(ethPriceToday[0].price_usd || 0)} </p> Render ethPriceToday */}
        <p></p><h3>Total Node Returns</h3>
        {<NodeAPRGrid rows={(nodeAPRs.nodeAPR || [])} />}

      </section>
      <section>
        <p></p><h3>Total Node Operator Returns</h3>

        {<NodeAPRGrid rows={(nodeAPRs.nodeOperatorAPR || [])} />}
      </section>
      <section>
        <p></p><h3>Total Protocol Returns</h3>

        {<NodeAPRGrid rows={(nodeAPRs.protocolAPR || [])} />}

      </section>
    </div>
  );
}


export default MinipoolAPR;
