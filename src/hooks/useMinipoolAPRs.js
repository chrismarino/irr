import { useState, useEffect } from 'react';
import getValidators from "../getValidators";
import getRocketpoolValidatorStats from "../getRocketpoolValidatorStats";
import getValidatorStats from "../getValidatorStats";
import calcMinipoolAPRs from "../calcMinipoolAPRs";
import calcPeriodicRewardsShare from "../calcPeriodicRewardsShare";
import getWalletHistory from '../getWalletHistory';
import { min } from 'moment';
let minipoolIndexArray = [];



function useMinipoolAPRs(nodeDetails, nodePeriodicRewards, minipoolDetails, ethPriceNow) {
  const nodeAddress = nodeDetails.nodeAddress;
  const [minipools, setMinipools] = useState([]);
  const [walletEthHistory, setWalletEthHistory] = useState([]);
  const [walletRPLHistory, setWalletRPLHistory] = useState([]);
  const [periodicRewardsShare, setPeriodicRewardsShare] = useState([]);
  const [nodeAPRs, setNodeAPRs] = useState([]);
  // Some state variables to keep track of the status of the fetches    
  const [gotValidators, setGotValidators] = useState(false);
  const [gotValidatorStats, setGotValidatorStats] = useState(false);
  const [gotRocketpoolDetails, setGotRocketpoolDetails] = useState(false);
  useEffect(() => {
    async function fetchValidatorArray() {
      // Fetch the list of validators indexed by the eth addresses of the node. From the list of validators, get the minipool 
      // stats for each validator. 
      var validatorArray = []; // reset the validator array
      if (nodeAddress === "" || typeof nodeAddress === "undefined") return; //don't run if the node address is empty
      setMinipools([]); //reset the minipools
      setNodeAPRs([]); //reset the nodeAPRs

      setGotValidators(false); // will be reset, unless there is an error or empty node address
      setGotValidatorStats(false);
      setGotRocketpoolDetails(false);
      //console.log("nodeAddress in fetchValidatorArray:", nodeAddress);
      try {
        validatorArray = await getValidators(nodeAddress);
        //Don't really need to .map this. Could go back to remove later...
        minipoolIndexArray = (validatorArray || []).map(item => ({
          validatorIndex: item.validatorindex,
          publicKey: item.publickey.toLowerCase(),
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
            balance: minipoolDetails.mpbalance ? minipoolDetails.mpbalance : 0,
            nodeBalance: minipoolDetails.nodeBalance ? minipoolDetails.nodeBalance : 0,
            prococolBalance: minipoolDetails.protocolBalance ? minipoolDetails.protocolBalance : 0,
            calulatedNodeShare: minipoolDetails.calculatedNodeShare ? minipoolDetails.calculatedNodeShare : 0,
            deposits: minipoolDetails.deposits ? minipoolDetails.deposits : 0,
            minipoolEthWithdrawn: minipoolDetails.totalWithdrawals ? minipoolDetails.totalWithdrawals : 0,
            validatorIndex: minipools[index].validatorIndex,
            bond: item.node_deposit_balance, //convert to eth
            status: minipools[index].status
          }));  //get the minipool addresses
          setMinipools(updatedMinipoolIndexArray);
          setGotRocketpoolDetails(true);
          //console.log("Minipools set from fetchRocketpoolValidatorStatsArray:", updatedMinipoolIndexArray);
        }
        catch (error) {
          console.log("Error fetching Rocketpool stats:", error);
        }

      }
    }
    fetchRocketpoolValidatorStatsArray();
  }, [gotValidators, minipoolDetails]);

  useEffect(() => {
    async function fetchMinipoolStats() {
      if (gotRocketpoolDetails === false) return; //only run if the rocketpool details have run
      for (const index of minipools) {
        try {
          const oneIndex = await getValidatorStats(index.validatorIndex);
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
    }
    fetchMinipoolStats();
  }, [gotRocketpoolDetails]);

  // only calculate the IRR when the withdrawls and deposits have been fetched
  // only render when the all the stats. withdrawls and deposits have been fetched

  useEffect(() => {
    //console.log("gotValidatorStats:", gotValidatorStats)
    if (gotValidatorStats && minipoolDetails.length > 0) {
      const calculatedNodeAPRs = calcMinipoolAPRs(walletEthHistory, walletRPLHistory, minipools, minipoolDetails, periodicRewardsShare, ethPriceNow);
      //const calculatedNodeAPRs = [];
      setNodeAPRs(calculatedNodeAPRs);
      //console.log("NodeAPRs returned from calcMinipoolAPRs:", calculatedNodeAPRs);
    }
  }, [gotValidatorStats, minipoolDetails]);


  useEffect(() => {
    async function nodeWalletHistory() {
      const walletEthHistory = await getWalletHistory(nodeAddress, "ethereum");
      setWalletEthHistory(walletEthHistory);
      const walletRPLHistory = await getWalletHistory(nodeAddress, "rocket-pool");
      setWalletRPLHistory(walletRPLHistory);
    }
    nodeWalletHistory();
  }, [nodeAddress]);

  // Calculate the share of periodic rewards for each minipool
  const stringifiedMinipoolDetails = JSON.stringify(minipoolDetails);
  useEffect(() => {
    let periodicRewardsShare = calcPeriodicRewardsShare(nodePeriodicRewards, minipoolDetails); {
      setPeriodicRewardsShare(periodicRewardsShare);
    }
  }, [nodePeriodicRewards, stringifiedMinipoolDetails]);

  return { nodeAPRs };
}


export default useMinipoolAPRs;
