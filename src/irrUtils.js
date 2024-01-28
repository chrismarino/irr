// Desc: This hook will calculate the IRR of a given set of cash flows.
import { convertRate, xirr } from 'node-irr';
import axios, { all } from 'axios';
import { formatArray } from './irrUtils'; // Import the formatArray function

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
  const minpoolIrrs = uniqueValidatorIndexes.forEach(minipool => {
    const filteredArray = totalArray.filter(item => item.validatorIndex === minipool);
    //let dailyRate = xirr(filteredArray).rate;
    //let days = xirr(filteredArray).days;
    //let irr = convertRate(dailyRate, "year")
  });

  return { minpoolIrrs };
}

export async function fetchWithdrawls(address) {
  // A utility function used to fetch the withdrawls from the ethscan API. Take a url as an argument.
  // Note: Probably should this to take minipool address as an argument.
  let appUrl = process.env.REACT_APP_ETHERSCAN_URL
  let apikey = process.env.REACT_APP_ETHERSCAN_KEY
  let module = "module=account&";
  let action = "action=txsBeaconWithdrawal&";
  let startblock = "startblock=0&";
  let endblock = "endblock=99999999&";
  let page = "page=1&";
  let offset = "offset=100&";
  let sort = "sort=asc&";
  let url = (appUrl + module + action + address + startblock + endblock + page + offset + sort + "apikey=" + apikey)
  try {
    let payouts = [];
    payouts = await axios(url);
    return payouts.data;
  } catch (error) {
    console.log("Axios Error:", error);
  }
};