

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { calcMinipoolAPRs, fetchMinipoolData, fetchValidators, fetchPriceData } from "../aprUtils.js";
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
let nodeAddress2 = "0x84cf8a46e6f77dbc6a33855320d68f7a1698c528"; //does not work. Throttled by coingecko
let nodeAddress4 = "0x1829f19524429a2edaf07bd13d1e47af19643d9b"
let nodeAddress3 = "0x20a3aba3c6851dd3b4f3c8cd73911cfb0a5e38a4";
let nodeAddress5 = "0xd9c2d5c041ad53b8b0d70968da88ecbf5e973cd3";

//Mock up a depositArray
const mockDeposits = [
  { validatorIndex: "983397", amount: -1000000000, timestamp: "1698661967" },
  { validatorIndex: "983397", amount: -31000000000, timestamp: "1698671967" },
  { validatorIndex: "1101573", amount: -1000000000, timestamp: "1698681967" },
  { validatorIndex: "1101573", amount: -31000000000, timestamp: "1698691967" },
  { validatorIndex: "810338", amount: -1000000000, timestamp: "1698670967" },
  { validatorIndex: "810338", amount: -31000000000, timestamp: "1698671967" },

]
//let minipoolAddressArray = [address1, address2, address3];
//let minipoolIndexArray = [index1, index2, index3];
let minipoolIndexArray = [];



function MinipoolAPR() {

  const [depositsAndWithdrawals, setDepositsAndWithdrawals] = React.useState([]);
  const [minipools, setMinipools] = React.useState([]);
  const [validatorCount, setValidatorCount] = useState(0);
  const [nodeAddress, setNodeAddress] = React.useState("");
  const [ethPriceToday, setEthPriceToday] = React.useState(0);


  //console.log("Test payouts.data: ", payouts.data);
  const depositsAndWithdrawalsHasRun = useRef(false);
  const validatorsHasRun = useRef(false);
  var validatorArray = [];
  var count = 0;

  useEffect(() => {
    async function fetchEthPrice() {
      const priceToday = await fetchPriceData(""); //fetch the price of eth. No date returns the current price.
      setEthPriceToday(priceToday);
    }
    fetchEthPrice();
  }, []);

  useEffect(() => {
    async function fetchValidatorArray() {
      if (nodeAddress === "") return;
      validatorArray = await fetchValidators(nodeAddress);
      depositsAndWithdrawalsHasRun.current = false // new node address, so reset the depositsAndWithdrawalsHasRun flag
      try {
        minipoolIndexArray = validatorArray.map(item => item.validatorindex);  //get the minipool addresses
        minipoolIndexArray = minipoolIndexArray.map(item => ({
          validatorIndex: item,
          status: true  //set the status of the minipool to active
        }));  //get the minipool addresses
        setMinipools(minipoolIndexArray);

        console.log("Minipool Index Array:", minipoolIndexArray);
      }
      catch (error) {
        console.log("Error creating validator index array:", error);
      }
    }
    fetchValidatorArray();
  }, [nodeAddress]);



  useEffect(() => {
    let allDepositsAndWithdrawals = [];
    async function fetchDepositsAndWithdrawals() {
      if (minipools.length === 0) return;
      console.log("Validators Has Run. minipools:", minipools);
      if (!depositsAndWithdrawalsHasRun.current && (validatorCount < minipools.length) ) {
        for (const index of minipools) {
          try {
            count = validatorCount + 1; //only run till the validator count is reached
            setValidatorCount(count);
            const oneIndex = await fetchMinipoolData(index.validatorIndex);
            allDepositsAndWithdrawals = allDepositsAndWithdrawals.concat(oneIndex.nodeDepositsAndWithdrawals); //response structure is different for deposits
            setDepositsAndWithdrawals(allDepositsAndWithdrawals);
            //see if the minipool has exited. Set it to false if it has.
            if (oneIndex.nodeDepositsAndWithdrawals.some(item => item.status === false)) {
              setMinipools(index.status = false);
            } 

            console.log( "valudator Count:", validatorCount, "total minipools:", minipools.length);
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
    console.log("Deposits and Withdrawals:", depositsAndWithdrawals, "minpool Index",  minipoolIndexArray, "eth price", ethPriceToday);
    minipoolAPRs = calcMinipoolAPRs(minipoolIndexArray, depositsAndWithdrawals, ethPriceToday);
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
    <div className="MinipoolAPR">
      <header className="MinipoolAPR-header">
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
                <th>Status</th>
                <th>Age</th>
                <th>Native APR</th>
                <th>Fiat Gain</th>
                <th>Fiat APR</th>
              </tr>
            </thead>
            <tbody>
              {
                (minipoolAPRs.minipoolAPRs || []).map((item, index) => (
                  <tr key={index}>
                    <td> {item.minipool} </td>
                    <td> {item.status ? 'Active' : 'Exited'} </td>
                    <td> {item.age} days </td>
                    <td> {item.eth_apr}%</td>
                    <td> {item.fiat_gain}</td>
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


export default MinipoolAPR;
