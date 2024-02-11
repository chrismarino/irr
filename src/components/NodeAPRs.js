import React, { useState, useEffect } from 'react';
import APRGrid from "./APRGrid";
import useMinipoolAPRs from '../hooks/useMinipoolAPRs';

function NodeAPRs({ nodeAddress, ethPriceNow }) {
  const { nodeAPRs } = useMinipoolAPRs(nodeAddress, ethPriceNow);
  const [prevNodeAddress, setPrevNodeAddress] = useState(nodeAddress);
  //console.log("nodeAddress, ethPriceNow in NodeAPRs:", nodeAddress, ethPriceNow)
  
  useEffect(() => {
    setPrevNodeAddress(nodeAddress);
  }, [nodeAddress]);

  if (nodeAddress !== prevNodeAddress) {
    return <div>Node address changed, calculating APRs...</div>;
  }

  if (!nodeAPRs.nodeAPR || !nodeAPRs.nodeOperatorAPR || !nodeAPRs.protocolAPR || nodeAPRs.length === 0 ) {
    return <div>Fetching Price History and Calculating APRs...</div>;
  }
  if (nodeAddress !== prevNodeAddress) {
    return <div>Node address changed, calculating APRs...</div>;
  } else {
  return (
    <div className="NodeAPRs">

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