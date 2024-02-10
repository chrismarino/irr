import React, { useState, useEffect } from 'react';
import APRGrid from "./APRGrid";
import useMinipoolAPRs from '../hooks/useMinipoolAPRs';
import usePriceNow from '../hooks/usePriceNow';

function NodeAPRs({ nodeAddress }) {
  const { nodeAPRs } = useMinipoolAPRs(nodeAddress);
  const { ethPriceNow, gotEthPriceNow } = usePriceNow();

  if (!gotEthPriceNow) {
    return <div>Loading...</div>;
  } return (
    <div className="NodeAPRs">
      <p>Current Ethereum Price: {(ethPriceNow[0].price_usd || [])}</p>
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