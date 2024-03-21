import { BrowserRouter, HashRouter, Route, Routes, Link } from "react-router-dom";
import React from "react";
import './App.css';
import {defaultAddress} from "./sampleAddresses";
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
  const [nodePeriodicRewards, setNodePeriodicRewards] = useState([]);
  const [nodeAddress, setNodeAddress] = useState(defaultAddress);
  const handleRewardsChange = (newRewards) => {
    setNodePeriodicRewards(newRewards);
    console.log("New Rewards:" , newRewards); // Do something with the values
  };

  if (!gotEthPriceNow || !gotRplPriceNow) {
    return <div>Loading current Eth and RPL prices...</div>;
  }
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
            <h1>Periodic Rewards</h1>
            <NodePeriodicRewardsTable 
              sx={{ mb: 5, border: 0 }}
              nodeAddress={nodeAddress}
              header={"header"}
              setRewardsOnChange={handleRewardsChange}
            />
            <h1>Minipool APRs</h1>
            {nodePeriodicRewards.some(reward => !reward.isLoading) &&
              <NodeAPRs nodeAddress={nodeAddress} nodePeriodicRewards = {nodePeriodicRewards} ethPriceNow={ethPrice} rplPriceNow={rplPrice} />
            }
          </div>
        } />
        <Route path="/performance" element={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1>Periodic Rewards</h1>
            <NodePeriodicRewardsTable 
              sx={{ mb: 5, border: 0 }}
              nodeAddress={nodeAddress}
              header={"header"}
              setRewardsOnChange={handleRewardsChange}
            />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
