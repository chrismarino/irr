import React from "react";
import './App.css';
import NodeAPRs from "./components/NodeAPRs";
import NodeAddressForm from "./components/NodeAddressForm";
import CurrentCoinPrices from './components/CurrentCoinPrices';
import usePriceNow from './hooks/usePriceNow';
import { useState, useEffect, useRef } from 'react';


function App() {
  const [nodeAddress, setNodeAddress] = useState("0x1829f19524429a2edaf07bd13d1e47af19643d9b");
  const { priceNow: ethPriceNow, gotPriceNow: gotEthPriceNow } = usePriceNow("ethereum");
  const { priceNow: rplPriceNow, gotPriceNow: gotRplPriceNow } = usePriceNow("rocket-pool");

  if (!gotEthPriceNow || !gotRplPriceNow) {
    return <div>Loading current Eth and RPL prices...</div>;
  }
  //const [nodeAddress, setNodeAddress] = useState("0x8f7fae807c3c3600fc952b7eadaa3a9a68d5b062"); // 2 validators 
  //const [nodeAddress, setNodeAddress] = useState("0xee43198c3be288fddabafefabbd49f6111b175c5"); // 6 validators. Works

  // set the node address to the default value of the Rocketpool node for dubugging purposes.
  // Some other addresses to test.
  //let nodeAddress2 = "0x84cf8a46e6f77dbc6a33855320d68f7a1698c528"; //does not work. Throttled by coingecko
  //let nodeAddress4 = "0x1829f19524429a2edaf07bd13d1e47af19643d9b"
  //let nodeAddress3 = "0x20a3aba3c6851dd3b4f3c8cd73911cfb0a5e38a4";
  //let nodeAddress5 = "0xd9c2d5c041ad53b8b0d70968da88ecbf5e973cd3"; // more than 20 validators

  return (
    <div className="App">
      <header className="App-header">
        <h1>Minipool APRs</h1>
        <NodeAddressForm setNodeAddress={setNodeAddress} nodeAddress={nodeAddress} />
        {/* <CurrentCoinPrices ethPriceNow={ethPriceNow} rplPriceNow={rplPriceNow} /> */}
        <NodeAPRs nodeAddress={nodeAddress} ethPriceNow={ethPriceNow} rplPriceNow={rplPriceNow} />
      </header>
    </div>
  );
}

export default App;
