import React from "react";
import './App.css';
import MinipoolAPR from "./components/MinipoolAPR";
import { useState, useEffect, useRef } from 'react';


function App() {
const [nodeAddress, setNodeAddress] = useState("0x635D06a61a36566003D71428F1895e146CdBD54E");
//const [nodeAddress, setNodeAddress] = useState("0x1829f19524429a2edaf07bd13d1e47af19643d9b");
// set the node address to the default value of the Rocketpool node for dubugging purposes.
// Some other addresses to test.
//let nodeAddress2 = "0x84cf8a46e6f77dbc6a33855320d68f7a1698c528"; //does not work. Throttled by coingecko
//let nodeAddress4 = "0x1829f19524429a2edaf07bd13d1e47af19643d9b"
//let nodeAddress3 = "0x20a3aba3c6851dd3b4f3c8cd73911cfb0a5e38a4";
//let nodeAddress5 = "0xd9c2d5c041ad53b8b0d70968da88ecbf5e973cd3"; // more than 20 validators
  return (
      <div className="App">
        <header className="App-header">
          <input
            type="text"
            value={nodeAddress}
            onChange={event => setNodeAddress(event.target.value)}
            placeholder="Enter node address"
          />
          <MinipoolAPR nodeAddress={nodeAddress} />

        </header>
      </div>

  );
}

export default App;
