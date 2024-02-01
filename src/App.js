import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { calcMinipoolAPRs, fetchMinipoolData, fetchValidators, fetchPriceData } from "./aprUtils.js";
let address1 = "address=0x6841ccfeAf1a9C1c5BD19BAdF0500B99C0BD7E97&";
let address2 = "address=0xb3684a0BB31Cde887bf02DBFc5738ebAF29a153A&";
let address3 = "address=0xA87BD09599B1d7Bcc321e0f08C4AE2B48A7Ece4f&";

//let address1 = "0x635D06a61a36566003D71428F1895e146CdBD54E";
//let address2 = "0xb3684a0BB31Cde887bf02DBFc5738ebAF29a153A";
//let address3 = "0xA87BD09599B1d7Bcc321e0f08C4AE2B48A7Ece4f";
let index1 = "983397";
let index2 = "1101573";
let index3 = "810338";
let nodeAddress1 = "0x635D06a61a36566003D71428F1895e146CdBD54E";
let nodeAddress2 = "0x84cf8a46e6f77dbc6a33855320d68f7a1698c528";
let nodeAddress3 = "0xc2392cbe1a23c755cd4c197d8f31cdbd678d80da"; //does not work
let nodeAddress4 = "0xd9c2d5c041ad53b8b0d70968da88ecbf5e973cd3";

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
//let minipoolIndexArray = [];



function App() {

  const [depositsAndWithdrawals, setDepositsAndWIthdrawals] = React.useState([]);
  const [minipools, setMinipools] = React.useState([]);
  const [depositCount, setDepositCount] = useState(1);
  const [nodeAddress, setNodeAddress] = React.useState(""); 
  const [ethPriceToday, setEthPriceToday] = React.useState(0);

  //console.log("Test payouts.data: ", payouts.data);
  const depositsAndWithdrawalsHasRun = useRef(false);
  const validatorsHasRun = useRef(false);
  var validatorArray = [];

  useEffect(() => {
    async function fetchEthPrice() {
      var today = new Date();
      const formattedDate = today.toISOString().slice(0, -14); //take off 14 characters to get the date in the format needed for the API
      const priceToday = await fetchPriceData(formattedDate);
      setEthPriceToday(priceToday);
    }
    fetchEthPrice();
  }, []);

  useEffect(() => {
    async function fetchValidatorArray() {
      validatorArray = await fetchValidators(nodeAddress);
      depositsAndWithdrawalsHasRun.current = false // new node address, so reset the depositsAndWithdrawalsHasRun flag
      try {
        minipoolAddressArray = validatorArray.map(item => item.validatorindex);  //get the minipool addresses
        setMinipools(minipoolAddressArray);
        console.log("Minipool Address Array:", minipoolAddressArray);
      }
      catch (error) {
        console.log("Error creating validator array:", error);
      }

    }
    fetchValidatorArray();
  }, [nodeAddress]);



  useEffect(() => {
    let allDepositsAndWithdrawals = [];
    async function fetchDepositsAndWithdrawals() {

      console.log("Validators Has Run. minipools:", minipools);
      if (!depositsAndWithdrawalsHasRun.current) {
        for (const index of minipools) {
          try {
            const oneIndex = await fetchMinipoolData(index);
            allDepositsAndWithdrawals = allDepositsAndWithdrawals.concat(oneIndex); //response structure is different for deposits
            setDepositsAndWIthdrawals(allDepositsAndWithdrawals);
            console.log("All Deposits:", allDepositsAndWithdrawals, "Deposit Count:", depositCount);
          }
          catch (error) {
            console.log("Error creating deposit array:", error);
          }
          depositsAndWithdrawalsHasRun.current = true;
        }
      }
    }

    fetchDepositsAndWithdrawals();
  }, [minipools]);


  var wd = [];
  var minipoolAPRs = [];
  // only calculate the IRR when the withdrawls and deposits have been fetched

  // only render when the withdrawls and deposits have been fetched
  if (depositsAndWithdrawalsHasRun.current) {
    // render the irrs...
    minipoolAPRs = calcMinipoolAPRs(depositsAndWithdrawals);
    console.log("Minipool IRRs:", minipoolAPRs);
    //render the withdrawls...);
    wd = (depositsAndWithdrawals || []).map(function (element) {
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
          <input
            type="text"
            value={nodeAddress}
            onChange={event => setNodeAddress(event.target.value)}
            placeholder="Enter node address"
          />
          <table>
            <thead>
              <tr>
                <th>Index</th>
                <th>Age</th>
                <th>Native Rate</th>
                <th>Fiat Rate</th>
              </tr>
            </thead>
            <tbody>
              {
                (minipoolAPRs.minipoolAPRs || []).map((item, index) => (
                  <tr key={index}>
                    <td> {item.minipool} </td>
                    <td> {item.age} days </td>
                    <td> {item.eth_apr}%</td>
                    <td> {item.fiat_apr}%</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </section>
      </header>
    </div>
  );
}


export default App;
