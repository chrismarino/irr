import React, { useState, useEffect } from 'react';
import APRGrid from "./APRGrid";
import useMinipoolAPRs from '../hooks/useMinipoolAPRs';
import usePriceNow from '../hooks/usePriceNow';

function NodeAPRs({ nodeAddress }) {

  const { priceNow: ethPriceNow, gotPriceNow: gotEthPriceNow } = usePriceNow("ethereum");
  const { priceNow: rplPriceNow, gotPriceNow: gotRplPriceNow } = usePriceNow("rocket-pool");
  const { nodeAPRs } = useMinipoolAPRs(nodeAddress);

  if (!gotEthPriceNow || !gotRplPriceNow || !nodeAPRs || !nodeAPRs.nodeAPR || !nodeAPRs.nodeOperatorAPR || !nodeAPRs.protocolAPR) {
    return <div>Loading...</div>;
  } return (
    <div className="NodeAPRs">
      <p>Current Ethereum Price: {(ethPriceNow[0].price_usd || [])}</p>
      <p>Current Rocketpool Price: {(rplPriceNow[0].price_usd || [])}</p>
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