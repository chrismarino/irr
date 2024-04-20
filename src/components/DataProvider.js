import React, { useState, useEffect, useRef } from 'react';
import DataContext from './DataContext';
import getPriceHistory from '../getPriceHistory';
import useNodePeriodicRewards from '../hooks/useNodePeriodicRewards'; // Adjust the path as needed
import CalcNodeIRRs from '../components/CalcNodeIRRs';

function DataProvider({ children }) {
  let defaultAddress = process.env.REACT_APP_DEFAULT_NODE_ADDRESS;
  const [ethPriceHistory, setEthPriceHistory] = useState([{ price_usd: 0 }]);
  const [rplPriceHistory, setRplPriceHistory] = useState([{ price_usd: 0 }]);
  const [minipoolHistory, setMinipoolHistory] = useState();
  const [minipools, setMinipools] = useState();
  const [show, setShow] = useState(false);
  const [progressStatus, setProgressStatus] = useState([]);
  const [done, setDone] = useState([]);
  const [nodeAddress, setNodeAddress] = useState(defaultAddress);
  const [nodeDetails, setNodeDetails] = useState([]); // [{}
  const [nodePeriodicRewards, setNodePeriodicRewards] = useState([{ isLoading: true }]);
  const [nodeNativeIRR, setNodeNativeIRR] = useState([]);
  const [nodeFiatIRR, setNodeFiatIRR] = useState([]);
  const [totalNodeAPR, setTotalNodeAPR] = useState([]);
  const [minipoolNativeIRR, setMinipoolNativeIRR] = useState([]);
  const [minipoolFiatIRR, setMinipoolFiatIRR] = useState([]);
  const [gotNodeDetails, setGotNodeDetails] = useState(false);
  const [stakedRPLDeposits, setStakedRPLDeposits] = useState(null);

  const prevNodeAddress = useRef(null);

  useEffect(() => {
    if (prevNodeAddress.current === nodeAddress) {
      return;
    }
    async function fetchPriceHistory() {
      const ethPriceHistory_g = await getPriceHistory("2023-01-01", "ethereum");
      const rplPriceHistory_g = await getPriceHistory("2023-01-01", "rpl");
      setEthPriceHistory(ethPriceHistory_g);
      setRplPriceHistory(rplPriceHistory_g);
      //console.log("In DataProvider. Got Price History. Node Address:", nodeAddress);
    }
    prevNodeAddress.current = nodeAddress;
    fetchPriceHistory();
  }, [nodeAddress]);

  //console.log("In DataProvider. About to call useNodePeriodictRewards:", nodeAddress, nodePeriodicRewards)
  const periodicRewards = useNodePeriodicRewards(nodeAddress, nodePeriodicRewards, setNodePeriodicRewards); // Use your custom Hook 

  return (
    <DataContext.Provider
      value={{
        ethPriceHistory, setEthPriceHistory,
        rplPriceHistory, setRplPriceHistory,
        minipools, setMinipools,
        minipoolHistory, setMinipoolHistory,
        stakedRPLDeposits, setStakedRPLDeposits,
        nodeAddress, setNodeAddress,
        nodeDetails, setNodeDetails,
        gotNodeDetails, setGotNodeDetails,
        nodePeriodicRewards, setNodePeriodicRewards,
        nodeFiatIRR, setNodeFiatIRR,
        nodeNativeIRR, setNodeNativeIRR,
        totalNodeAPR, setTotalNodeAPR,
        minipoolNativeIRR, setMinipoolNativeIRR,
        minipoolFiatIRR, setMinipoolFiatIRR,
        show, setShow,
        progressStatus, setProgressStatus,
        done, setDone
      }}>
      {children}
      <CalcNodeIRRs /> {/* If CalcNodeIRRs is a component */}
    </DataContext.Provider>
  );
}

export default DataProvider;