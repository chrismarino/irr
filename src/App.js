import logo from './logo.svg';
import axios from 'axios';
import './App.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
let appUrl = process.env.REACT_APP_ETHERSCAN_URL
let apikey = process.env.REACT_APP_ETHERSCAN_KEY
let module = "module=account&";
let action = "action=txsBeaconWithdrawal&";
let address = "address=0x6841ccfeAf1a9C1c5BD19BAdF0500B99C0BD7E97&";
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
      console.log("Axios Error:", error);
    }
  };

  useEffect(() => {
    fetchWithdrawls();
  }, [])
  //  const ax = await axios.formToJSON
  //const w_data = withdrawls.data;
  let w_result = withdrawls.result;

  var wd = [];
  wd = (w_result || []).map(function (element) {
    let date = new Date(element.timestamp * 1000);
    const withdrawlsItem = ["Index: ", element.validatorIndex, " ", date.toDateString(), ": " + element.amount / 1000000000, " Eth"];
    return withdrawlsItem;
  }
  );
  console.log(wd);
  //console.log("Minipool Withdrawls:", wd);

  return (
    <div className="App">
      <header className="App-header">
        <section>
          {
            wd.map((item, index) => (
              <p key={index}>{item}</p>
            ))
          }
        </section>

      </header>
    </div>
  );
}


export default App;
