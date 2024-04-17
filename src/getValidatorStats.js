// New fetchDeposit function that uses the validator stats API endpoint
import axios from 'axios';

export default async function getValidatorStats(validatorIndex) {

  // A utility function used to fetch the deposits and withdrawl history from an API. Take a url as an argument.
  let status = true;
  let appUrl = process.env.REACT_APP_BEACONCHAIN_URL
  let apiEndpoint = appUrl + "/api/v1"
  let apikey = process.env.REACT_APP_BEACONCHAIN_KEY
  let node_action = "/validator/stats/";
  let depositDaysArray = [];
  let statsUrl = (apiEndpoint + node_action + validatorIndex + "?apikey=" + apikey)
  try {
    let payouts = [];
    payouts = await axios(statsUrl);
    var mpDepositsAndWithdrawals = payouts.data.data.map(item => ({
      day: item.day, // The day in the life of the chain
      date: item.day_start, // day of the deposit or withdrawl. Don't reformat this date needed as Date later
      deposits: item.deposits,
      withdrawals: item.withdrawals,
      deposits_amount: item.deposits_amount,
      withdrawals_amount: item.withdrawals_amount,
      validatorIndex: validatorIndex,
      status: true
    })).filter(item => item.deposits_amount > 0 || item.withdrawals_amount > 0);
    // Set the minipool status to false if the minipool has exited. Do this before another async call.
    mpDepositsAndWithdrawals = mpDepositsAndWithdrawals.map(item => {
      if (item.withdrawals_amount === 32000000000) {
        status = false; // set the status for this minipool to false
        return { ...item, status: false }; //set it in the data array as well.
      } else {
        return item;
      }
    });
    // Create an array of deposit dates so we can look up the eth price at the time of the deposit
    let depositDays = await Promise.all(mpDepositsAndWithdrawals.filter(item => item.deposits_amount > 0));
    depositDaysArray.push(depositDays.date);
    //console.log("Node Deposits and Withdrawals dates:", depositDaysArray);
    return { mpDepositsAndWithdrawals, depositDaysArray, status };
  } catch (error) {
    console.log("Axios Error on Deposit Fetch:", error);
  }
};