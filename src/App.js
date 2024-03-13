import { BrowserRouter, HashRouter, Route, Routes, Link } from "react-router-dom";
import React from "react";
import './App.css';
import NodeAPRs from "./components/NodeAPRs";
import NodeAddressForm from "./components/NodeAddressForm";
import NodePeriodicRewardsTable from "./components/NodePeriodicRewardsTable";
import CurrentCoinPrices from './components/CurrentCoinPrices';
import usePriceNow from './hooks/usePriceNow';
import { useState, useEffect, useRef } from 'react';

function Router({ children }) {
  if (process.env.REACT_APP_ROUTER === "hash") {
    return <HashRouter>{children}</HashRouter>;
  }
  return <BrowserRouter>{children}</BrowserRouter>;
}
function App() {

  const { priceNow: ethPrice, gotPriceNow: gotEthPriceNow } = usePriceNow("ethereum");
  //const [ethPriceNow, setEthPriceNow] = useState();
  //setEthPriceNow(ethPrice);
  const { priceNow: rplPrice, gotPriceNow: gotRplPriceNow } = usePriceNow("rocket-pool");
  //const [rplPriceNow, setRplPriceNow] = useState();
  //setRplPriceNow(rplPrice);
  const [nodeAddress, setNodeAddress] = useState("0xfc49f773756eabb2680fd505916c2a93b65b465b");


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
    <Router>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <Link to="/" style={{ margin: '0 10px' }}>Home</Link>
        <Link to="/performance" style={{ margin: '0 10px' }}>APRs</Link>
      </div>
      <Routes>
        <Route path="/" element={
          <div style={{ width: 1200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1>Minipool Returns Calculator</h1>
            <NodeAddressForm setNodeAddress={setNodeAddress} nodeAddress={nodeAddress} />
            <CurrentCoinPrices ethPriceNow={ethPrice} rplPriceNow={rplPrice} />
            <h1>Minipool APRs</h1>
            <NodeAPRs nodeAddress={nodeAddress} ethPriceNow={ethPrice} rplPriceNow={rplPrice} />
          </div>
        } />
        <Route path="/performance" element={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1>Periodic Rewards</h1>
            <NodePeriodicRewardsTable
              sx={{ mb: 5, border: 0 }}
              nodeAddress={nodeAddress}
              header={"header"}
            />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
