// Desc: This hook will calculate the IRR of a given set of cash flows.
import { convertRate, xirr } from 'node-irr';
import axios, { all } from 'axios';
import { formatArray } from './irrUtils'; // Import the formatArray function
import _ from "lodash";

export function calcMinipoolIrr(depositArray, withdrawlArray) {
  // A utility function used to calculate the irr of a given set of in and out cash flows from a 
  // set of minipools. It takes 
  // a depositArray for deposits into the minipool, including both the node operators and the protocol's. 
  // The withdrawlArray requires the same feils and  includes only periodic execution layer rewards.
  // and the repayment of the deposit. Input arrays are objects 
  // with 'ValidatorIndex' field, an 'amount' feild as well as a 'timestamp' field. It returns an object with the irr and days.
  // It returns an object with the irr and days.
  // paymentArray is not actually an Array, but an Object that incldues a 'amount' feild as well as a
  // 'timestamp' field. It returns 
  // an annay of day counts and irr per minpool. paymentArray is typically the result of a query to the etherscan API.
  var totalArray = [];

  function formatArray(array) {
    return (array || []).map(function (element) {
      let paymentDate = new Date(element.timestamp * 1000);
      let year = paymentDate.getFullYear();
      let month = String(paymentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
      let day = String(paymentDate.getDate()).padStart(2, '0');
      const formattedPaymentDate = `${year}${month}${day}`;
      return { validatorIndex: element.validatorIndex, amount: element.amount, date: formattedPaymentDate };
    });
  }
  //combine the despots and withdrawls into a single array for the IRR calculation
  totalArray = formatArray(depositArray).concat(formatArray(withdrawlArray));
  totalArray.sort() //make sure they are sorted by date
  //finc the minipool indices...
  // write the code that creates an array containg unique ValidatorIndex values in totalArray
  const uniqueValidatorIndexes = [...new Set(totalArray.map(item => item.validatorIndex))];

  //filter the array for each minipool and calculate the IRR
  const minipoolIrrs = []
  //Failed attempt to use lodash to filter the array for each minipool and calculate the IRR
  //let uniq = _.uniqBy(totalArray, 'validatorIndex');
  //uniq.forEach(minipool => {
  uniqueValidatorIndexes.forEach(minipool => {
    const filteredArray = totalArray.filter(item => item.validatorIndex === minipool);
    let dailyRate = xirr(filteredArray).rate;
    let days = xirr(filteredArray).days;
    let irr = convertRate(dailyRate, "year");

    minipoolIrrs.push({ minipool: minipool, days: days, irr: irr });
  });

  return { minipoolIrrs };
}

export async function fetchWithdrawls(address) {
  // A utility function used to fetch the withdrawls from the ethscan API. Take a url as an argument.
  // Note: Probably should this to take minipool address as an argument.
  let appUrl = process.env.REACT_APP_ETHERSCAN_URL
  let apikey = process.env.REACT_APP_ETHERSCAN_KEY
  let apiEndpoint = appUrl + "api?"
  let module = "module=account&";
  let action = "action=txsBeaconWithdrawal&";
  let startblock = "startblock=0&";
  let endblock = "endblock=99999999&";
  let page = "page=1&";
  let offset = "offset=100&";
  let sort = "sort=asc&";
  let withdrawalUrl = (apiEndpoint + module + action + address + startblock + endblock + page + offset + sort + "apikey=" + apikey)

  try {
    let payouts = [];
    payouts = await axios(withdrawalUrl);
    return payouts.data;
  } catch (error) {
    console.log("Axios Error on Withdrawls Fetch:", error);
  }
};

export async function fetchDeposits(index) {
  // A utility function used to fetch the deposits and withdrawls from an API. Take a url as an argument.

  // the deposit url using the beaconcha.in API
  let appUrl = process.env.REACT_APP_BEACONCHAIN_URL
  let apiEndpoint = appUrl + "api/v1/validator/"
  let apikey = process.env.REACT_APP_BEACONCHAIN_KEY
  let deposit_action = "/deposits?";

  let depositlUrl = (apiEndpoint + index + deposit_action + "apikey=" + apikey)
  try {
    let payouts = [];
    payouts = await axios(depositlUrl);
    // map the deposits to the same format as the withdrawls (beasoncha.in API returns a different format)
    const renamedPayouts = payouts.data.data.map(item => ({
      timestamp: item.block_ts, //change the timestamp field
      amount: item.amount, //leave the other fields the same
      validatorIndex: index //add the validatorIndex field

    }));
    return renamedPayouts;
    //return payouts.data;
  } catch (error) {
    console.log("Axios Error on Deposit Fetch:", error);
  }
};

