// CurrentCoinPrices.js
import React from 'react';

function CurrentCoinPrices({ ethPriceNow, rplPriceNow }) {
  return (
    <>
      <p>Current Ethereum Price: {(ethPriceNow[0].price_usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || [])}</p>
      <p>Current Rocketpool Price: {(rplPriceNow[0].price_usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || [])}</p>
    </>
  );
}

export default CurrentCoinPrices;