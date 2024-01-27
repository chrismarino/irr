import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {useIirr, fetchWithdrawls} from "./irrUtils.js";
let address1 = "address=0x6841ccfeAf1a9C1c5BD19BAdF0500B99C0BD7E97&";
let address2 = "address=0xb3684a0BB31Cde887bf02DBFc5738ebAF29a153A&";
let address3 = "address=0xA87BD09599B1d7Bcc321e0f08C4AE2B48A7Ece4f&";
let minipoolArray = [address1, address2, address3];
let allWithdrawls = [];
let datetest = [];
function App() {
  const [withdrawls, setWithdrawls] = React.useState([]);

  //console.log("Test payouts.data: ", payouts.data);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      minipoolArray.forEach((address) => {
        fetchWithdrawls(address).then(oneWithdrawl => {
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
