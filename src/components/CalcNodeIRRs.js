import React, { useState, useEffect, useContext } from 'react';
import APRGrid from "./APRGrid";
import WalletTable from './WalletTable';
import useMinipoolIRRs from '../hooks/useMinipoolIRRs';
import useMinipoolHistory from '../hooks/useMinipoolHistory';
import useNodeDetails from '../hooks/useNodeDetails';
import DataContext from './DataContext';
import useStakedRPLDeposits from '../hooks/useStakedRPLDeposits';

function CalcNodeIRRs() {
  const {
    ethPriceHistory,
    rplPriceHistory,
    nodeAddress,
    nodeDetails,
    setNodeDetails,
    minipoolHistory,
    setMinipoolHistory,
    setStakedRPLDeposits,
  } = useContext(DataContext);
  //("in CalcNodeIRRs", nodeAddress);
  var MinipoolEvents = []


  //const [minipoolEvents, setMinipoolEvents] = useState(null);
  const [gotNodeDetails, setGotNodeDetails] = useState(false);
  const [gotStakedRPL, setGotStakedRPL] = useState(false);
  //const [minipoolRewards, setMinipoolRewards] = useState([]);


  const NodeDetails = useNodeDetails(nodeAddress);
  const stringifiedNodeDetails = JSON.stringify(NodeDetails);

  useEffect(() => {
    async function fetchNodeDetails() {

      if (!gotNodeDetails && (!NodeDetails?.isLoading || false)) {
        setNodeDetails({ ...NodeDetails }); // new object to trigger re-render
        //console.log("Node Address", nodeAddress, "NodeDetails after set:", NodeDetails);
        setGotNodeDetails(true);
        //setProgressStatus("Got Node Details...still working...")
      }
    }
    fetchNodeDetails();
  }, [NodeDetails, gotNodeDetails, nodeAddress, stringifiedNodeDetails]);

  useEffect(() => {
    setGotNodeDetails(false);
  }, [minipoolHistory]);

  // Get the staked deposits for the node using the same approach as the node details
  const StakedRPLDeposits = useStakedRPLDeposits(nodeAddress, rplPriceHistory);
  const stringifiedStakedRPLDeposits = JSON.stringify(StakedRPLDeposits);
  useEffect(() => {
    async function fetchStakedRPLDeposits() {
      //if (!gotStakedRPL) {
      setStakedRPLDeposits(StakedRPLDeposits);
      //console.log("Node Address", nodeAddress, "Stake Details after set:", stakedRPL);
      setGotStakedRPL(true);
      //ressStatus("Got Staked RPL Deposits...still working...")
      // }  
    }
    fetchStakedRPLDeposits();
  }, [StakedRPLDeposits, gotStakedRPL, nodeAddress, stringifiedStakedRPLDeposits]);

  // get the minipool details for the node as well..
  let MinipoolHistory = useMinipoolHistory(nodeAddress, ethPriceHistory);
  const stringifiedMinipoolHistory = JSON.stringify(MinipoolHistory);
  useEffect(() => {

    async function fetchMinipoolHistory() {
      let newMpDetails =  MinipoolHistory;
      //if (MinipoolHistory.every(element => !element.isLoading)) {
        setMinipoolHistory(newMpDetails);
        //setProgressStatus("Got Minipool History...still working...")
      //}
      //console.log("New MinipoolHistory", newMpDetails);
    }
    fetchMinipoolHistory();
  }, [stringifiedMinipoolHistory, nodeAddress]); // will this work?

  const xyz = useMinipoolIRRs(nodeDetails, minipoolHistory);

  return
}


export default CalcNodeIRRs;