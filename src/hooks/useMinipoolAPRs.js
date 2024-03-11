import { useState, useEffect } from 'react';
import getValidators from "../getValidators";
import getPriceData from "../getPriceData";
//import getPriceDataFromCoinbase from "../getPriceDataFromCoinbase";
import getRocketpoolValidatorStats from "../getRocketpoolValidatorStats";
import getValidatorStats from "../getValidatorStats";
import calcMinipoolAPRs from "../calcMinipoolAPRs";
import _ from "lodash";
import getWalletHistory from '../getWalletHistory';
let minipoolIndexArray = [];



function useMinipoolAPRs(nodeAddress, minipoolDetails, ethPriceNow) {
  const [depositsAndWithdrawals, setDepositsAndWithdrawals] = useState([]);
  const [minipools, setMinipools] = useState([]);
  const [walletEthHistory, setWalletEthHistory] = useState([]);
  const [walletRPLHistory, setWalletRPLHistory] = useState([]);
  const [nodeAPRs, setNodeAPRs] = useState([]);
  // Some state variables to keep track of the status of the fetches    
  const [gotValidators, setGotValidators] = useState(false);

  const [gotValidatorStats, setGotValidatorStats] = useState(false);
  const [gotRocketpoolDetails, setGotRocketpoolDetails] = useState(false);
  const [gotDepositsAndWithdrawals, setGotDepositsAndWithdrawals] = useState(false);
  useEffect(() => {
    async function fetchValidatorArray() {
      // Fetch the list of validators indexed by the eth addresses of the node. From the list of validators, get the minipool 
      // stats for each validator. 
      var validatorArray = []; // reset the validator array

      if (nodeAddress === "") return; //don't run if the node address is empty
      setMinipools([]); //reset the minipools
      setNodeAPRs([]); //reset the nodeAPRs

      setGotValidators(false); // will be reset, unless there is an error or empty node address
      setGotValidatorStats(false);
      setDepositsAndWithdrawals([]);
      setGotDepositsAndWithdrawals(false); // new node address, so reset the HasRun flags
      setGotRocketpoolDetails(false);
      //console.log("nodeAddress in fetchValidatorArray:", nodeAddress);
      try {
        validatorArray = await getValidators(nodeAddress);
        minipoolIndexArray = (validatorArray || []).map(item => item.validatorindex);  //get the minipool addresses  || [])
        minipoolIndexArray = (minipoolIndexArray || []).map(item => ({
          validatorIndex: item,
          status: true  //set the status of the minipool to active
        }));  //get the minipool addresses
        setMinipools(minipoolIndexArray);
        setGotValidators(true);
        //console.log("Minipool Index Array set from fetchValidator Array:", minipoolIndexArray);
      }
      catch (error) {
        console.log("Error creating validator index array:", error);
      }
    }
    fetchValidatorArray();
  }, [nodeAddress]);

  useEffect(() => {
    async function fetchRocketpoolValidatorStatsArray() {
      var minipoolArray = []; // reset the minipool array
      if (gotValidators === true && gotRocketpoolDetails === false && minipoolDetails !== null) { //only run if the validator array has run, but only once.
        try {
          minipoolArray = await getRocketpoolValidatorStats(minipools); //minipools includes an array of validator indexes
          let updatedMinipoolIndexArray = minipools;
          updatedMinipoolIndexArray = (minipoolArray || []).map((item, index) => ({
            minipoolStats: item,
            deposits: minipoolDetails.deposits,
            withdrawals: minipoolDetails.withdrawals,
            validatorIndex: minipools[index].validatorIndex,
            bond: item.node_deposit_balance, //convert to eth
            status: minipools[index].status
          }));  //get the minipool addresses
          setMinipools(updatedMinipoolIndexArray);
          setGotRocketpoolDetails(true);
          console.log("Minipools set from fetchRocketpoolValidatorStatsArray:", updatedMinipoolIndexArray);
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
          allDepositsAndWithdrawals = allDepositsAndWithdrawals.concat(oneIndex.mpDepositsAndWithdrawals); //response structure is different for deposits
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

 

  // only calculate the IRR when the withdrawls and deposits have been fetched
  // only render when the all the stats. withdrawls and deposits have been fetched

  useEffect(() => {
    console.log("gotDepostsAndWithdrawals:", gotDepositsAndWithdrawals, "gotValidatorStats:", gotValidatorStats )
    if (gotDepositsAndWithdrawals && gotValidatorStats) {
      const calculatedNodeAPRs = calcMinipoolAPRs(minipools, minipoolDetails, depositsAndWithdrawals, ethPriceNow);
      //const calculatedNodeAPRs = [];
      setNodeAPRs(calculatedNodeAPRs);

      //console.log("NodeAPRs returned from calcMinipoolAPRs:", calculatedNodeAPRs);
    }
  }, [gotDepositsAndWithdrawals, gotValidatorStats]);


  useEffect(() => {
    async function nodeWalletHistory() {
      const walletEthHistory = await getWalletHistory(nodeAddress, "ethereum");
      setWalletEthHistory(walletEthHistory);
      const walletRPLHistory = await getWalletHistory(nodeAddress, "rocket-pool");
      setWalletRPLHistory(walletRPLHistory);
    }
    nodeWalletHistory();
  }, [nodeAddress]);

  return { nodeAPRs };
}


export default useMinipoolAPRs;
