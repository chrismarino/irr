import { useState, useEffect, useContext } from 'react';
import getValidators from "../getValidators";
import getRocketpoolValidatorStats from "../getRocketpoolValidatorStats";
import getValidatorStats from "../getValidatorStats";
import calcMinipoolNativeIRRs from "../calcMinipoolNativeIRRs";
import calcMinipoolFiatIRRs from "../calcMinipoolFiatIRRs";
import calcWalletNativeIRRs from "../calcWalletNativeIRRs";
import calcWalletFiatIRRs from "../calcWalletFiatIRRs";
import calcPeriodicRewardsShare from "../calcPeriodicRewardsShare";
import getWalletEthHistory from '../getWalletEthHistory';
import getWalletRPLHistory from '../getWalletRPLHistory';
import DataContext from '../components/DataContext';
let minipoolIndexArray = [];



function useMinipoolIRRs(nodeDetails, minipoolHistory) {
  const { ethPriceHistory, rplPriceHistory, nodeAddress, nodePeriodicRewards,
    setProgressStatus, setDone, setMinipoolHistory, setNodeFiatIRR,
    setNodeNativeIRR, stakedRPLDeposits, setMinipoolNativeIRR, setMinipoolFiatIRR } = useContext(DataContext);
  //const nodeAddress = nodeDetails.nodeAddress;
  //let ethPriceToday = ethPriceHistory[0].price_usd || 0; //today is the first element in the array
  //let rplPriceToday = rplPriceHistory[0].price_usd || 0; //today is the first element in the array
  const [minipools, setMinipools] = useState([]);
  const [walletEthHistory, setWalletEthHistory] = useState([]);
  const [walletRPLHistory, setWalletRPLHistory] = useState([]);
  const [periodicRewardsShare, setPeriodicRewardsShare] = useState([]);
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
      setGotValidators(false); // will be reset, unless there is an error or empty node address
      setGotValidatorStats(false);
      setGotRocketpoolDetails(false);
      setMinipoolHistory([]);  //reset the minipool history
      setWalletEthHistory([]);  //reset the wallet history
      setWalletRPLHistory([]);
      setProgressStatus("New Node Address. Getting Validators...")
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
        //setProgressStatus("Got ", minipoolIndexArray.length, "Validators...still working...")
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
      if (minipoolHistory === undefined) {
        return;
      }
      var minipoolArray = []; // reset the minipool array
      if (gotValidators === true && gotRocketpoolDetails === false && minipoolHistory !== null) { //only run if the validator array has run, but only once.
        try {
          minipoolArray = await getRocketpoolValidatorStats(minipools); //minipools includes an array of validator indexes
          if (!minipoolArray) {
            setProgressStatus("Not a Rocketpool Node. Try again")
          }
          let updatedMinipoolIndexArray = minipools;
          updatedMinipoolIndexArray = (minipoolArray || []).map((item, index) => ({
            minipoolStats: item,
            balance: minipoolHistory.mpBalance ? minipoolHistory.mpBalance : 0,
            nodeBalance: minipoolHistory.nodeBalance ? minipoolHistory.nodeBalance : 0,
            prococolBalance: minipoolHistory.protocolBalance ? minipoolHistory.protocolBalance : 0,
            calulatedNodeShare: minipoolHistory.calculatedNodeShare ? minipoolHistory.calculatedNodeShare : 0,
            deposits: minipoolHistory.deposits ? minipoolHistory.deposits : 0,
            minipoolEthWithdrawn: minipoolHistory.totalDistributions ? minipoolHistory.totalDistributions : 0,
            validatorIndex: minipools[index].validatorIndex,
            bond: item.node_deposit_balance, //convert to eth
            status: minipools[index].status
          }));  //get the minipool addresses
          setMinipools(updatedMinipoolIndexArray);
          setGotRocketpoolDetails(true);
          //console.log("Minipools set from fetchRocketpoolValidatorStatsArray:", updatedMinipoolIndexArray);
        }
        catch (error) {
          console.log("Error fetching Rocketpool stats. Minipools:", minipools, "Rocketpool Stats:", minipoolArray, "Error:", error);
        }

      }
    }
    fetchRocketpoolValidatorStatsArray();
  }, [gotValidators, minipoolHistory]);

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
  const ready = (gotValidatorStats &&
    gotRocketpoolDetails &&
    (ethPriceHistory && ethPriceHistory.length > 0) &&
    (rplPriceHistory && rplPriceHistory.length > 0) &&
    (stakedRPLDeposits && stakedRPLDeposits.length > 0) &&
    (minipoolHistory && minipoolHistory.length > 0) &&
    (periodicRewardsShare && periodicRewardsShare.length > 0) &&
    (typeof walletEthHistory !== 'string') &&
    (typeof walletRPLHistory !== 'string') > 0) || 0; // Some array has no length, so check for string
  // console.log("Ready:", ready,
  //   "gotValidatorStats:", gotValidatorStats,
  //   "gotRocketpoolDetails:", gotRocketpoolDetails,
  //   "ethPriceHistory check:", (ethPriceHistory && ethPriceHistory.length > 0),
  //   "rplPriceHistory check:", (rplPriceHistory && rplPriceHistory.length > 0),
  //   "stakedRPLDeposits:", stakedRPLDeposits,
  //   "minipoolHistory check:", (minipoolHistory && minipoolHistory.length > 0),
  //   "periodicRewardsShare check:", (periodicRewardsShare && periodicRewardsShare.length > 0) ,
  //   "walletEthHistory:", walletEthHistory,
  //   "walletRPLHistory:", walletRPLHistory);

  useEffect(() => {
    if (ready) {
      const minipoolNativeIRR = calcMinipoolNativeIRRs(minipools, minipoolHistory, periodicRewardsShare, ethPriceHistory, rplPriceHistory);
      const minipoolFiatIRR = calcMinipoolFiatIRRs(minipools, minipoolHistory, periodicRewardsShare, ethPriceHistory, rplPriceHistory);
      //setTotalNodeAPR(calculatedNodeAPRs.totalNodeAPR);
      setMinipoolNativeIRR(minipoolNativeIRR);
      setMinipoolFiatIRR(minipoolFiatIRR);
      //setProgressStatus("Got Minipool IRRs...still working...")

      // Calculate teh wallet APRs
      const walletNativeIRR = calcWalletNativeIRRs(
        walletEthHistory,
        walletRPLHistory,
        minipools,
        minipoolHistory,
        periodicRewardsShare,
        ethPriceHistory,  // calc ethPriceToday locally
        rplPriceHistory,
        stakedRPLDeposits,
        minipoolNativeIRR,
        minipoolFiatIRR,
        nodePeriodicRewards,
        nodeDetails);
      setNodeNativeIRR(walletNativeIRR);
      const walletFiatIRR = calcWalletFiatIRRs(
        walletEthHistory,
        walletRPLHistory,
        minipools,
        minipoolHistory,
        periodicRewardsShare,
        ethPriceHistory,  // calc ethPriceToday locally
        rplPriceHistory,
        stakedRPLDeposits,
        minipoolNativeIRR,
        minipoolFiatIRR,
        nodePeriodicRewards,
        nodeDetails);
      setNodeFiatIRR(walletFiatIRR);
      setDone("Done")
    }
  }, [ready]);

  // Get the on chain history of the wallet from Etherscan...
  useEffect(() => {
    if (ethPriceHistory.length > 0 && rplPriceHistory.length > 0 && nodeAddress !== "" && typeof nodeAddress !== "undefined") {
      async function nodeWalletHistory() {
        const walletEthHistory = await getWalletEthHistory(nodeAddress, ethPriceHistory);
        setWalletEthHistory(walletEthHistory);
        const walletRPLHistory = await getWalletRPLHistory(nodeAddress, rplPriceHistory);
        setWalletRPLHistory(walletRPLHistory);
      }
      nodeWalletHistory();
    }
  }, [nodeAddress, ethPriceHistory, rplPriceHistory]);

  // Calculate the share of periodic rewards for each minipool
  const stringifiedMinipoolHistory = JSON.stringify(minipoolHistory);
  useEffect(() => {
    let periodicRewardsShare = calcPeriodicRewardsShare(nodePeriodicRewards, minipoolHistory, walletRPLHistory); {
      setPeriodicRewardsShare(periodicRewardsShare);
    }
  }, [nodePeriodicRewards, walletRPLHistory, stringifiedMinipoolHistory]);

  return;
}


export default useMinipoolIRRs;
