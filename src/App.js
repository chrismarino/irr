import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { calcMinipoolIrr, fetchWithdrawls, fetchDeposits, fetchValidators } from "./irrUtils.js";
let address1 = "address=0x6841ccfeAf1a9C1c5BD19BAdF0500B99C0BD7E97&";
let address2 = "address=0xb3684a0BB31Cde887bf02DBFc5738ebAF29a153A&";
let address3 = "address=0xA87BD09599B1d7Bcc321e0f08C4AE2B48A7Ece4f&";

//let address1 = "0x635D06a61a36566003D71428F1895e146CdBD54E";
//let address2 = "0xb3684a0BB31Cde887bf02DBFc5738ebAF29a153A";
//let address3 = "0xA87BD09599B1d7Bcc321e0f08C4AE2B48A7Ece4f";
let index1 = "983397";
let index2 = "1101573";
let index3 = "810338";
let nodeAddress = "0x635D06a61a36566003D71428F1895e146CdBD54E";

//Mock up a depositArray
const mockDeposits = [
  { validatorIndex: "983397", amount: -1000000000, timestamp: "1698661967" },
  { validatorIndex: "983397", amount: -31000000000, timestamp: "1698671967" },
  { validatorIndex: "1101573", amount: -1000000000, timestamp: "1698681967" },
  { validatorIndex: "1101573", amount: -31000000000, timestamp: "1698691967" },
  { validatorIndex: "810338", amount: -1000000000, timestamp: "1698670967" },
  { validatorIndex: "810338", amount: -31000000000, timestamp: "1698671967" },

]
let minipoolAddressArray = [address1, address2, address3];
//let minipoolIndexArray = [index1, index2, index3];
let minipoolIndexArray = [];


function App() {
  const [withdrawls, setWithdrawls] = React.useState([]);
  const [deposits, setDeposits] = React.useState([]);
  const [minipools, setMinipools] = React.useState([]);
  const [withdrawlCount, setWithdrawlCount] = useState(1);
  const [depositCount, setDepositCount] = useState(1);

  //console.log("Test payouts.data: ", payouts.data);
  const withdrawalsHasRun = useRef(false);
  const depositsHasRun = useRef(false);
  const validatorsHasRun = useRef(false);
  var validatorArray = [];

  useEffect(() => {
    async function fetchValidatorArray() {
      validatorArray = await fetchValidators(nodeAddress);
      if (!validatorsHasRun.current) {
        try {
          minipoolAddressArray = validatorArray.map(item => item.validatorindex);  //get the minipool addresses
          setMinipools(minipoolAddressArray);
          console.log("Minipool Address Array:", minipoolAddressArray);
        }
        catch (error) {
          console.log("Error creating validator array:", error);
        }
      }
      validatorsHasRun.current = true;
    }
    fetchValidatorArray();
  }, []);


  useEffect(() => {
    let allWithdrawls = [];
    async function fetchData1() {
      if (!withdrawalsHasRun.current) {
        for (const address of minipoolAddressArray) {
          try {
            const oneWithdrawl = await fetchWithdrawls(address);
            allWithdrawls = allWithdrawls.concat(oneWithdrawl);
            setWithdrawls(allWithdrawls);
            console.log("All Withdrawals:", allWithdrawls, "Withdrawl Count:", withdrawlCount);
          }
          catch (error) {
            console.log("Error creating withdrawal array:", error);
          }
        }
        withdrawalsHasRun.current = true;
      }
    }
    fetchData1();
  }, []);

  useEffect(() => {
    let allDeposits = [];
    async function fetchData2() {
      if (validatorsHasRun.current) { //only run this after the validators have been fetched
        console.log("Validators Has Run. minipools:", minipools);
        if (!depositsHasRun.current) {
          for (const index of minipools) {
            try {
              const oneDeposit = await fetchDeposits(index);
              allDeposits = allDeposits.concat(oneDeposit); //response structure is different for deposits
              setDeposits(allDeposits);
              console.log("All Deposits:", allDeposits, "Deposit Count:", depositCount);
            }
            catch (error) {
              console.log("Error creating deposit array:", error);
            }
          }
          depositsHasRun.current = true;
        }
      }
    }
    fetchData2();
  }, [minipoolIndexArray, validatorsHasRun.current]);
  //Now that we have all the withdrawls, we can calculate the IRR.

  if (!withdrawls.length || !deposits.length) {
    return <div>Loading...</div>; // Or your loading spinner
  }

  var wd = [];
  var minipoolIrrs = [];
  // only calculate the IRR when the withdrawls and deposits have been fetched

  // only render when the withdrawls and deposits have been fetched
  if (depositsHasRun.current && withdrawalsHasRun.current) {
    // render the irrs...
    minipoolIrrs = calcMinipoolIrr(deposits, withdrawls);
    console.log("Minipool IRRs:", minipoolIrrs);
    //render the withdrawls...);
    wd = (withdrawls || []).map(function (element) {
      let date = new Date(element.timestamp * 1000);
      const withdrawlsItem = ["Index: ", element.validatorIndex, " ", date.toDateString(), ": " + element.amount / 1000000000, " Eth"];
      return withdrawlsItem;
    }
    );
    //console.log(wd);
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
        <section>
          {
            (minipoolIrrs.minipoolIrrs || []).map((item, index) => (
              <p key={index}>Index={item.minipool} Age={item.days} Rate={item.irr}</p>
            ))
          }
        </section>
      </header>
    </div>
  );
}


export default App;
