// Pulling out the caliculation of the APRs from the main app.js file to make it easier to read and maintain.
import _ from "lodash";


export default function calcMinipoolAPRs(minipools, nodeDepositsAndWithdrawals, ethPriceToday) {
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
  var minipools = minipools;

  //combine the despots and withdrawls into a single array for the IRR calculation
  totalArray = formatArray(nodeDepositsAndWithdrawals);
  //totalArray.sort() //make sure they are sorted by date
  totalArray = _.sortBy(totalArray, function (item) {
    return new Date(item.date);
  });
  //finc the minipool indices...
  // write the code that creates an array containg unique ValidatorIndex values in totalArray
  const uniqueValidatorIndexes = [...new Set(totalArray.map(item => item.validatorIndex))];
  // don't think I need this since I saved the list of validators in the from the node API
  //filter the array for each minipool and calculate the IRR
  const minipoolAPRs = []
  //Failed attempt to use lodash to filter the array for each minipool and calculate the IRR
  //let uniq = _.uniqBy(totalArray, 'validatorIndex');
  //uniq.forEach(minipool => {
  uniqueValidatorIndexes.forEach(minipool => {
    const filteredArray = totalArray.filter(item => item.validatorIndex === minipool);
    // need to know what minipool we're working with to fetch the details. 
    let minipoolData = minipools.find(pool => pool.validatorIndex === minipool);
    if (minipoolData.minipoolStats === undefined) {
      throw new Error("Minipool data is undefined. Minipool: " + minipool);
    }
    let minDay = _.minBy(filteredArray, 'days').days;
    let maxDay = _.maxBy(filteredArray, 'days').days;
    let days = (maxDay - minDay);
    var totalNOEthDeposited = minipoolData.minipoolStats.node_deposit_balance || 0;
    var totalProtocolEthDeposited = minipoolData.minipoolStats.user_deposit_balance || 0;
    var totalEthDeposited = totalNOEthDeposited + totalProtocolEthDeposited;
    totalNOEthDeposited = (totalNOEthDeposited / 1E18) //convert to gwei
    totalProtocolEthDeposited = (totalProtocolEthDeposited / 1E18)
    totalEthDeposited = (totalEthDeposited / 1E18)

    let totalEthEarned = _.sumBy(filteredArray, 'eth_amount'); //total eth earned by the minipool
    let totalFiatDeposited = _.sumBy(filteredArray, 'fiat_amount'); // total fiat deposited by the minipool
    // Total fiat deposited is the share of the total fiat deposited.
    let totalNOFiatDeposited = totalFiatDeposited * (totalNOEthDeposited / totalEthDeposited);
    let totalProtocolFiatDeposited = totalFiatDeposited * (totalProtocolEthDeposited / totalEthDeposited);
    if (totalEthEarned > 0) { totalEthEarned = totalEthEarned - 32000000000 } //back out the 32 eth deposit
    totalEthEarned = -(totalEthEarned / 1000000000)

    var protocolEthEarned = totalEthEarned * (totalProtocolEthDeposited / totalEthDeposited); 
    var nodeOperatorEthEarned = totalEthEarned * (totalNOEthDeposited / totalEthDeposited);
    const commission = protocolEthEarned * minipoolData.minipoolStats.minipool_node_fee; //Calculate the commission
    protocolEthEarned = protocolEthEarned - commission; //paid by the protocol
    nodeOperatorEthEarned = nodeOperatorEthEarned + commission; //to the Node Operator


    // Fiat gains are the eth earned - eth deposited, times the current price of eth
    const totalFiatGain = ((totalEthEarned + totalEthDeposited) * ethPriceToday.eth_price_usd) - totalFiatDeposited;
    const protocolFiatGain = ((protocolEthEarned + totalProtocolEthDeposited) * ethPriceToday.eth_price_usd) - totalProtocolFiatDeposited;
    const nodeOperatorFiatGain = ((nodeOperatorEthEarned + totalNOEthDeposited) * ethPriceToday.eth_price_usd) - totalNOFiatDeposited;

    //if (totalFiatDeposited > 0) { totalFiatDeposited = totalFiatDeposited - 32000000000 * 2350 } //back out the 32 eth deposit
    let minipoolIndex = minipools.find(pool => pool.validatorIndex === minipool);
    let status = minipoolIndex.status;
    const eth_apr = ((((100) * (365 / days) * totalEthEarned)) / totalEthDeposited).toFixed(3);
    const fiat_apr = (((100) * (365 / days) * totalFiatGain) / (totalFiatDeposited)).toFixed(2);
    const no_eth_apr = ((((100) * (365 / days) * nodeOperatorEthEarned)) / totalNOEthDeposited).toFixed(3);
    const p_eth_apr = (((100) * (365 / days) * protocolEthEarned) / (totalProtocolEthDeposited)).toFixed(2);
    const no_fiat_apr = (((100) * (365 / days) * nodeOperatorFiatGain) / (totalNOFiatDeposited)).toFixed(2);
    const p_fiat_apr = (((100) * (365 / days) * protocolFiatGain) / (totalProtocolFiatDeposited)).toFixed(2);
    minipoolAPRs.push({
      minipool: minipool,
      status: status,
      age: days,
      // Overall node results
      eth_deposited: totalEthDeposited.toFixed(5), //total eth deposited by the minipool
      eth_earned: (totalEthEarned.toFixed(5)), //total eth earned by the minipool
      eth_apr: eth_apr,
      fiat_gain: totalFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //Total node's gain
      fiat_apr: fiat_apr,
      //Node Operator results
      no_eth_deposited: totalNOEthDeposited.toFixed(5), //node operators eth deposited
      no_eth_earned: (-nodeOperatorEthEarned.toFixed(5)), //node operators eth earned
      no_eth_apr: no_eth_apr, //node operator apr
      no_fiat_gain: nodeOperatorFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //node operators gain
      no_fiat_apr: no_fiat_apr, //node operator apr

      // Protocol results
      p_eth_deposited: totalProtocolEthDeposited.toFixed(5), //protocol eth deposited
      p_eth_earned: (-protocolEthEarned.toFixed(5)), //protocol eth earned
      p_eth_apr: p_eth_apr, //protocol apr
      p_fiat_gain: protocolFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //protocol gain
      p_fiat_apr: p_fiat_apr //protocol apr in SD

    });
  });

  return { minipoolAPRs };
}

function formatArray(array) {
  return (array || []).map(function (element) {

    // currently accepted formats for strings:
    // YYYYMMDD, YYYY-MM-DD, YYYY/MM/DD
    ///const originalDate = element.day;
    //const reformattedDate = originalDate.split('T')[0];
    const dateObject = new Date(element.date);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
    const day = String(dateObject.getDate()).padStart(2, '0');

    const reformattedDate = `${year}-${month}-${day}`;
    const dailyEthFlow = element.deposits_amount - element.withdrawals_amount;
    return { validatorIndex: element.validatorIndex, eth_amount: dailyEthFlow, fiat_amount: element.fiat_amount, days: element.day, date: reformattedDate };
  });
}