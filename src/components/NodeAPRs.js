import React, { useState, useEffect } from 'react';
import APRGrid from "./APRGrid";
import MinipoolDetailGrid from "./MinipoolDetailGrid";
import MinipoolEventsGrid from "./MinipoolEventsGrid";
import useMinipoolAPRs from '../hooks/useMinipoolAPRs';
import useMinipoolDetails from '../hooks/useMinipoolDetails';
import useMinipoolEvents from '../hooks/useMinipoolEvents';

function NodeAPRs({ nodeAddress, ethPriceNow }) {
  const { nodeAPRs } = useMinipoolAPRs(nodeAddress, ethPriceNow);
  const MinipoolDetails = useMinipoolDetails(nodeAddress);
  //const MinipoolEvents = useMinipoolEvents(MinipoolDetails);
  console.log("MinipoolDetails:", MinipoolDetails);
  //console.log("MinipoolEvents:", MinipoolEvents);
  const [minipoolEvents, setMinipoolEvents] = useState([]);
  const [minipoolDetails, setMinipoolDetails] = useState([]);
  const [prevNodeAddress, setPrevNodeAddress] = useState(nodeAddress);
  //console.log("nodeAddress, ethPriceNow in NodeAPRs:", nodeAddress, ethPriceNow)

  useEffect(() => {
    setPrevNodeAddress(nodeAddress);
  }, [nodeAddress]);

   useEffect(() => {
     async function fetchMinipoolDetails() {
       const details = await Promise.all(MinipoolDetails);
       setMinipoolDetails(details);
       console.log("MinipoolDetails:", details);
     }
     fetchMinipoolDetails();
   }, []);

  // useEffect(() => {
  //   async function fetchMinipoolEvents() {
  //     if (MinipoolDetails.length > 0) {
  //       const events = await Promise.all(MinipoolEvents);
  //       setMinipoolEvents(events);
  //       console.log("MinipoolEvents:", events);
  //     }
  //   }
  //   fetchMinipoolEvents();
  //}, []);  //Only fetch MinipoolEvents after MinipoolDetails are fetched

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
        {/* <section>
          <p></p><h3>Minipool Events</h3>
          {<MinipoolEventsGrid rows={(MinipoolEvents || [])} />}
        </section> */}
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