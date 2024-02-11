// CurrentCoinPrices.js
import React from 'react';

function CurrentCoinPrices({ ethPriceNow, rplPriceNow }) {
  return (
    <>
      <p>Current Ethereum Price: {(ethPriceNow[0].price_usd || [])}</p>
      <p>Current Rocketpool Price: {(rplPriceNow[0].price_usd || [])}</p>
    </>
  );
}

export default CurrentCoinPrices;