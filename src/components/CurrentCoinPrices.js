// CurrentCoinPrices.js
import React from 'react';

function CurrentCoinPrices({ ethPriceNow, rplPriceNow }) {
  return (
    <>
      <p>Current Ethereum Price: ${(ethPriceNow[0].price_usd.toFixed(2) || [])}</p>
      <p>Current Rocketpool Price: ${(rplPriceNow[0].price_usd.toFixed(2) || [])}</p>
    </>
  );
}

export default CurrentCoinPrices;