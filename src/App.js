import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import React, { useState, useEffect, useContext } from 'react';
import NodeNative from "./pages/NodeNative";
import NodeFiat from "./pages/NodeFiat";
import MinipoolNative from "./pages/MinipoolNative";
import MinipoolFiat from "./pages/MinipoolFiat";
import PeriodicRewards from "./pages/PeriodicRewards";
import About from "./pages/About";
import Topoff from "./pages/Topoff";
import useMinipoolIRRs from './hooks/useMinipoolIRRs';
import useMinipoolHistory from './hooks/useMinipoolHistory';
import useNodeDetails from './hooks/useNodeDetails';
import DataContext from './components/DataContext';
import useStakedRPLDeposits from './hooks/useStakedRPLDeposits';

function Routes() {
  const routing = useRoutes([
    { path: '', element: <NodeNative /> },
    { path: 'node-fiat', element: <NodeFiat /> },
    { path: 'minipools-native', element: <MinipoolNative /> },
    { path: 'minipools-fiat', element: <MinipoolFiat /> },
    { path: 'rewards', element: <PeriodicRewards /> },
    { path: 'topoff', element: <Topoff /> },
    { path: 'about', element: <About /> },
  ]);
  return routing;
}

function App() {

  const {
    ethPriceHistory,
    rplPriceHistory,
    nodeAddress,
    nodeDetails,
    setNodeDetails,
    setProgressStatus,
    setStakedRPLDeposits,
  } = useContext(DataContext);
  //("in CalcNodeIRRs", nodeAddress);

  const [minipoolHistory, setMinipoolHistory] = useState();
  const [gotNodeDetails, setGotNodeDetails] = useState(false);
  const [gotStakedRPL, setGotStakedRPL] = useState(false);
  //const [minipoolRewards, setMinipoolRewards] = useState([]);
  //console.log("nodeAddress, ethPriceToday in NodeAPRs:", nodeAddress, ethPriceToday)

  const NodeDetails = useNodeDetails(nodeAddress);
  const stringifiedNodeDetails = JSON.stringify(NodeDetails);

  useEffect(() => {
    async function fetchNodeDetails() {

      if (!gotNodeDetails && (!NodeDetails?.isLoading || false)) {
        setNodeDetails({ ...NodeDetails }); // new object to trigger re-render
        //console.log("Node Address", nodeAddress, "NodeDetails after set:", NodeDetails);
        setGotNodeDetails(true);
        setProgressStatus("Progress Status: Got Node Details...still working...")
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
  //console.log("StakedRPLDeposits", StakedRPLDeposits, "Stringified", stringifiedStakedRPLDeposits);
  useEffect(() => {
    async function fetchStakedRPLDeposits() {
      //if (!gotStakedRPL) {
      setStakedRPLDeposits(StakedRPLDeposits);
      //console.log("Node Address", nodeAddress, "Stake Details after set:", stakedRPL);
      setGotStakedRPL(true);
      setProgressStatus("Progress Status: Got Staked RPL Deposits...still working...")
      // }  
    }
    fetchStakedRPLDeposits();
  }, [StakedRPLDeposits, gotStakedRPL, nodeAddress, stringifiedStakedRPLDeposits]);

  // get the minipool details for the node as well..
  let MinipoolHistory = useMinipoolHistory(nodeAddress, ethPriceHistory);
  const stringifiedMinipoolHistory = JSON.stringify(MinipoolHistory);
  useEffect(() => {
    //console.log("in CalcNodeIRRs/MinipoolHistory", nodeAddress);
    async function fetchMinipoolHistory() {
      let newMpDetails = MinipoolHistory;
      setMinipoolHistory(newMpDetails);

      //console.log("New MinipoolHistory", newMpDetails);
    }
    fetchMinipoolHistory();
  }, [stringifiedMinipoolHistory, nodeAddress]); // will this work?

  const xyz = useMinipoolIRRs(nodeDetails, minipoolHistory);


  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes />
    </Router>
  );
}
export default App;