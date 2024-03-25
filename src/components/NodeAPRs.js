import React, { useState, useEffect } from 'react';
import APRGrid from "./APRGrid";
import WalletGrid from "./WalletGrid";
import WalletGridTransposedCols from "./WalletGridTransposedCols";
import WalletTable from './WalletTable';
import _ from "lodash";
import useMinipoolAPRs from '../hooks/useMinipoolAPRs';
import useMinipoolDetails from '../hooks/useMinipoolDetails';
import useNodeDetails from '../hooks/useNodeDetails';
import useNodeDeposits from '../hooks/useNodeDeposits';

function NodeAPRs({ nodeAddress, nodePeriodicRewards, ethPriceToday, rplPriceToday }) {


  var MinipoolEvents = []
  //console.log("MinipoolDetails from nodeAPRs:", MinipoolDetails);
  //console.log("MinipoolEvent from nodeAPRs:", MinipoolEvents);
  const [minipoolEvents, setMinipoolEvents] = useState(null);
  const [minipoolDetails, setMinipoolDetails] = useState();
  const [nodeDetails, setNodeDetails] = useState([]);
  const [gotNodeDetails, setGotNodeDetails] = useState(false);
  const [minipoolRewards, setMinipoolRewards] = useState([]);
  //console.log("nodeAddress, ethPriceToday in NodeAPRs:", nodeAddress, ethPriceToday)

  const NodeDetails = useNodeDetails(nodeAddress);
  const stringifiedNodeDetails = JSON.stringify(NodeDetails);

  useEffect(() => {
    async function fetchNodeDetails() {
      if (!gotNodeDetails && !NodeDetails.isLoading) {
        setNodeDetails({ ...NodeDetails }); // new object to trigger re-render
        //console.log("Node Address", nodeAddress, "NodeDetails after set:", NodeDetails);
        setGotNodeDetails(true);
      }
    }
    fetchNodeDetails();
  }, [NodeDetails, gotNodeDetails, nodeAddress, stringifiedNodeDetails]);

  useEffect(() => {
    setGotNodeDetails(false);
  }, [minipoolDetails]);
  
// do I need this? Not used anywhere, but will keep it for now.
  //const nodeDeposits = useNodeDeposits(nodeAddress); //these are the deposits from the node to minipools.
  //if (nodeDeposits.isLoading) {
    // The data is still loading
    //console.log('Data is loading...');
  //} else {
    //console.log("nodeDeposits:", nodeDeposits);
  //}

  let MinipoolDetails = useMinipoolDetails(nodeAddress);
  const stringifiedMinipoolDetails = JSON.stringify(MinipoolDetails);
  useEffect(() => {
    async function fetchMinipoolDetails() {
      //if (gotMinipoolDetails) {
      //  return;
      //}
      let newMpDetails = await Promise.all(MinipoolDetails);
      if (MinipoolDetails.every(element => !element.isLoading)) {
        setMinipoolDetails(newMpDetails);
        //setGotMinipoolDetails(true);
        //console.log("Node Address", nodeAddress );
        //console.log("MinipoolDetails after set:", MinipoolDetails);
        //console.log("newMpDetails after set:", newMpDetails);
      }
    }
    fetchMinipoolDetails();
  }, [stringifiedMinipoolDetails]); // will this work?

  const { nodeAPRs } = useMinipoolAPRs(nodeDetails, nodePeriodicRewards, minipoolDetails, ethPriceToday, rplPriceToday);
  if (nodeAddress === "") {
    return <div>Enter a node address and hit Enter...</div>;
  }



  if (!nodeAPRs.nodeAPR || !nodeAPRs.nodeOperatorAPR || !nodeAPRs.protocolAPR || nodeAPRs.length === 0) {
    return <div>Fetching Price History and Calculating APRs...</div>;
  }

  return (
    <div className="NodeAPRs">
      <section>
        <p></p><h3>Node {nodeAddress} wallet details</h3>
        {<WalletTable gridRows={nodeAPRs.walletAPR} />}
      </section>
      <section>
        <p></p><h3>Total Node Returns</h3>
        {<APRGrid rows={(nodeAPRs.nodeAPR || [])} />}
      </section>
      <section>
        <p></p><h3>Total Node Operator Returns</h3>
        {<APRGrid rows={(nodeAPRs.nodeOperatorAPR || [])} />}
      </section>
      <section>
        <p></p><h3>Total Protocol Returns</h3>
        {<APRGrid rows={(nodeAPRs.protocolAPR || [])} />}
      </section>
    </div>
  );
}


export default NodeAPRs;