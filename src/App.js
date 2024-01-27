import logo from './logo.svg';
import axios from 'axios';
import './App.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
let appUrl = process.env.REACT_APP_ETHERSCAN_URL
let apikey = process.env.REACT_APP_ETHERSCAN_KEY
let module = "module=account&";
let action = "action=txsBeaconWithdrawal&";
let address = "address=0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f&";
let startblock = "startblock=0&";
let endblock = "endblock=99999999&";
let page = "page=1&";
let offset = "offset=100&";
let sort = "sort=asc&";
let url = (appUrl + module + action + address + startblock + endblock + page + offset + sort + "apikey=" + apikey)

function App() {
  const [withdrawls, setWithdrawls] = React.useState([]);
  const fetchWithdrawls = async () => {
    try {
      const irr = await axios(url);
      setWithdrawls(irr.data);  //use with axios
      //const data = await irr.json(); // use with fetch()
      // setWithdrawls(data); // use with fetch()
      //console.log("data:", irr);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchWithdrawls();
  }, [])
//  const ax = await axios.formToJSON

  //const w_data = withdrawls.data;
  const w_result = withdrawls.result;
  const w = withdrawls;
  const map1 = w_result.map((ttt) => ttt.timestamp );
  console.log("Full Response:", withdrawls, "\nResults:", w_result, "\nJust timesta,p:", map1);

return (
  <div className="App">
    <header className="App-header">
      <section>
        {/* {withdrawls.result.map((payout) => {
            return (
        <article>
          <p>Index: {payout.withdrawlIndex} Amount:{payout.result.amount} Time: {payout.result.timestamp}</p>
        </article>
        );
          })} */}
      </section>

    </header>
  </div>
);
}


export default App;
