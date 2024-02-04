import React from "react";
import './App.css';
import MinipoolAPR from "./components/MinipoolAPR";



function App() {
const [nodeAddress, setNodeAddress] = React.useState("0x635D06a61a36566003D71428F1895e146CdBD54E");
// set the node address to the default value of the Rocketpool node for dubugging purposes.
// Some other addresses to test.
//let address1 = "0x635D06a61a36566003D71428F1895e146CdBD54E";
//let address2 = "0xb3684a0BB31Cde887bf02DBFc5738ebAF29a153A";
//let address3 = "0xA87BD09599B1d7Bcc321e0f08C4AE2B48A7Ece4f";
// const [nodeAddress, setNodeAddress] = React.useState("0x635D06a61a36566003D71428F1895e146CdBD54E");
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
