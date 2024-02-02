import React from "react";
import './App.css';
import MinipoolAPR from "./components/MinipoolAPR";



function App() {
  const [nodeAddress, setNodeAddress] = React.useState("");
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
