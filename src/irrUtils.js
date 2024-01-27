// Desc: This hook will calculate the IRR of a given set of cash flows.
import { convertRate } from 'node-irr';
import { xirr } from 'node-irr';
import axios, { all } from 'axios';

export function calcMinipoolIrr(paymentArray) {
  // A utility function used to calculate the irr of a given set of cash flows, paymentArray. 
  // paymentArray is a any any array that incldudes an 'amount' and 'timestamp' key. It returns 
  //an arry day counts and irr. paymentArray is typically the result of a query to the etherscan API.
  var newArray = [];

  paymentArray = (paymentArray || []).map(function (element) {
    let paymentDate = new Date(element.timestamp * 1000);
    let year = paymentDate.getFullYear();
    let month = String(paymentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
    let day = String(paymentDate.getDate()).padStart(2, '0');
    const formattedPaymentDate = `${year}${month}${day}`;
    return { amount: element.amount / 32E18, date: formattedPaymentDate };

  });
  const dailyRate = xirr(paymentArray).rate;
  const days = xirr(paymentArray).days;

  //Balance is uniformly earned over the period.

  //express the rate in APR
  let rate = convertRate(dailyRate, "year")
  //let rate = 100 * (data3 / 32E18) * (365 / days); //APR
  return { days, rate };
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