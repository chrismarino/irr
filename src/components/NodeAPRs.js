import React, { useState, useEffect } from 'react';
import APRGrid from "./APRGrid";
import _ from "lodash";
import MinipoolDetailGrid from "./MinipoolDetailGrid";
import useMinipoolAPRs from '../hooks/useMinipoolAPRs';
import useMinipoolDetails from '../hooks/useMinipoolDetails';
import useNodeDetails from '../hooks/useNodeDetails';
import useNodeDeposits from '../hooks/useNodeDeposits';

function NodeAPRs({ nodeAddress, ethPriceNow }) {


  var MinipoolEvents = []
  //console.log("MinipoolDetails from nodeAPRs:", MinipoolDetails);
  //console.log("MinipoolEvent from nodeAPRs:", MinipoolEvents);
  const [minipoolEvents, setMinipoolEvents] = useState(null);
  const [minipoolDetails, setMinipoolDetails] = useState([]);
  const [gotMinipoolDetails, setGotMinipoolDetails] = useState(false);
  const [minipoolRewards, setMinipoolRewards] = useState([]);
  const [prevNodeAddress, setPrevNodeAddress] = useState(nodeAddress);
  //console.log("nodeAddress, ethPriceNow in NodeAPRs:", nodeAddress, ethPriceNow)
  const nodeDetails = useNodeDetails(nodeAddress);
  if (nodeDetails.isLoading) {
    // The data is still loading
    //console.log('Data is loading...');
  } else {
    //console.log("registrationTime:", nodeDetails.registrationTime);
    //console.log("Eth Balance:", nodeDetails.balanceETH);
    //console.log("RPL Balance:", nodeDetails.balanceRPL);
    //console.log("effectiveRPLStake:", nodeDetails.effectiveRPLStake);
    //console.log("ethMatched:", nodeDetails.ethMatched);
  }

  const nodeDeposits = useNodeDeposits(nodeAddress);
  if (nodeDeposits.isLoading) {
    // The data is still loading
    //console.log('Data is loading...');
  } else {
    //console.log("nodeDeposits:", nodeDeposits);
  }

  useEffect(() => {
    setPrevNodeAddress(nodeAddress);
  }, [nodeAddress]);

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
        console.log("Node Address", nodeAddress, "MinipoolDetails after set:", newMpDetails);
      }
    }
    fetchMinipoolDetails();
  }, [stringifiedMinipoolDetails]); // will this work?

  const { nodeAPRs } = useMinipoolAPRs(nodeAddress, minipoolDetails, ethPriceNow);
  if (nodeAddress === "") {
    return <div>Enter a node address and hit Enter...</div>;
  }

  if (nodeAddress !== prevNodeAddress) {
    return <div>Node address changed, calculating APRs...</div>;
  }

  if (!nodeAPRs.nodeAPR || !nodeAPRs.nodeOperatorAPR || !nodeAPRs.protocolAPR || nodeAPRs.length === 0) {
    return <div>Fetching Price History and Calculating APRs...</div>;
  }
  if (nodeAddress !== prevNodeAddress) {
    return <div>Node address changed, calculating APRs...</div>;
  } else {
    return (
      <div className="NodeAPRs">
        <section>
          <p></p><h3>Minipool Details</h3>

          {<MinipoolDetailGrid rows={(MinipoolDetails || [])} />}
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
}

export default NodeAPRs;