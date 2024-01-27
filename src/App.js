import logo from './logo.svg';
import axios, { all } from 'axios';
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import irr from "./irr.js";
let appUrl = process.env.REACT_APP_ETHERSCAN_URL
let apikey = process.env.REACT_APP_ETHERSCAN_KEY
let module = "module=account&";
let action = "action=txsBeaconWithdrawal&";
let address1 = "address=0x6841ccfeAf1a9C1c5BD19BAdF0500B99C0BD7E97&";
let address2 = "address=0xb3684a0BB31Cde887bf02DBFc5738ebAF29a153A&";
let address3 = "address=0xA87BD09599B1d7Bcc321e0f08C4AE2B48A7Ece4f&";
let startblock = "startblock=0&";
let endblock = "endblock=99999999&";
let page = "page=1&";
let offset = "offset=100&";
let sort = "sort=asc&";
let url1 = (appUrl + module + action + address1 + startblock + endblock + page + offset + sort + "apikey=" + apikey)
let url2 = (appUrl + module + action + address2 + startblock + endblock + page + offset + sort + "apikey=" + apikey)
let url3 = (appUrl + module + action + address3 + startblock + endblock + page + offset + sort + "apikey=" + apikey)
let minipoolArray = [url1, url2, url3];
let allWithdrawls = [];
let datetest = [];
function App() {
  const [withdrawls, setWithdrawls] = React.useState([]);
  async function fetchWithdrawls(url) {
    try {
      const payouts = await axios(url);
      return payouts.data;
    } catch (error) {
      console.log("Axios Error:", error);
    }
  };
//console.log("Test payouts.data: ", payouts.data);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      minipoolArray.forEach((url) => {
        fetchWithdrawls(url).then(oneWithdrawl => {
          allWithdrawls = allWithdrawls.concat(oneWithdrawl.result);
          //console.log("allWithdrawls:", allWithdrawls);
          setWithdrawls(allWithdrawls);
        });
      });
      hasRun.current = true;
    }
  }, []);


  var wd = [];
  if (hasRun.current) {

    wd = (withdrawls || []).map(function (element) {
      let date = new Date(element.timestamp * 1000);
      const withdrawlsItem = ["Index: ", element.validatorIndex, " ", date.toDateString(), ": " + element.amount / 1000000000, " Eth"];
      return withdrawlsItem;
    }
    );
    console.log(wd);
    //console.log("Minipool Withdrawls:", wd);
  }
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
