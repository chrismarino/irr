import React, { useState, useEffect } from 'react';
import APRGrid from "./APRGrid";
import useMinipoolAPRs from '../hooks/useMinipoolAPRs';
import usePriceNow from '../hooks/usePriceNow';
import CurrentCoinPrices from './CurrentCoinPrices';

function NodeAPRs({ nodeAddress }) {

  //const { priceNow: ethPriceNow, gotPriceNow: gotEthPriceNow } = usePriceNow("ethereum");
  //const { priceNow: rplPriceNow, gotPriceNow: gotRplPriceNow } = usePriceNow("rocket-pool");
  const { priceNow: ethPriceNow, gotPriceNow: gotEthPriceNow } = usePriceNow("ethereum");
  const { priceNow: rplPriceNow, gotPriceNow: gotRplPriceNow } = usePriceNow("rocket-pool");
  const { nodeAPRs } = useMinipoolAPRs(nodeAddress, ethPriceNow);

  if (!gotEthPriceNow || !gotRplPriceNow ) {
    return <div>Loading currnet Eth and RPL prices...</div>;
  } 
  if (!nodeAPRs.nodeAPR || !nodeAPRs.nodeOperatorAPR || !nodeAPRs.protocolAPR) {
    return <div>Calculating APRs...</div>;
  } 
  
  return (
    <div className="NodeAPRs">
      <CurrentCoinPrices ethPriceNow={ethPriceNow} rplPriceNow={rplPriceNow} />
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