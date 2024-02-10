import React, { useState, useEffect } from 'react';
import APRGrid from "./APRGrid";
import useMinipoolAPRs from '../hooks/useMinipoolAPRs';

function NodeAPRs({ nodeAddress }) {
  const nodeAPRs = useMinipoolAPRs(nodeAddress);
  return (
    <div className="NodeAPRs">
      {/* <p>ETH Price Now: ${ethPriceToday.eth_price_usd} RPL Price Now: ${ethPriceToday.rpl_price_usd}</p>
      <p></p><h3>Total Node Returns</h3> */}
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