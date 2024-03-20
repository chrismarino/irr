// Pulling out the caliculation of the APRs from the main app.js file to make it easier to read and maintain.
import _ from "lodash";

export default function calcMinipoolAPRs(walletEthHistory, walletRPLHistory, minipools, minipoolDetails, ethPriceToday) {
  var walletEthDeposited = _.sumBy(walletEthHistory.deposits, "amount") / 1E18;
  var walletRPLDeposited = _.sumBy(walletRPLHistory.deposits, "amount") / 1E18;
  var walletEthWithdrawn = _.sumBy(walletEthHistory.withdrawals, "amount") / 1E18;
  var walletRPLWithdrawn = _.sumBy(walletRPLHistory.withdrawals, "amount") / 1E18;

  //find the minipool indices...
  const uniqueValidatorIndexes = [...new Set(minipools.map(item => item.validatorIndex))];
  // don't think I need this since I saved the list of validators in the from the node API
  //filter the array for each minipool and calculate the IRR
  var nodeAPR = [];
  var nodeOperatorAPR = [];
  var protocolAPR = [];
  //console.log("ethPriceToday from calc minipools:", ethPriceToday);
  //const ethPriceNow = (ethPriceToday[0].price_usd  || 0); // ethPriceToday is an array of objects with a single object.
  const ethPriceNow = ethPriceToday;
  uniqueValidatorIndexes.forEach(minipool => {
    // need to know what minipool we're working with to fetch the details. 
    let minipoolData = minipools.find(pool => pool.validatorIndex === minipool);
    let mpDetail = minipoolDetails.find(mpDetails => mpDetails.minipoolAddress === minipoolData.minipoolStats.minipool_address);
    if (minipoolData.minipoolStats === undefined) {
      throw new Error("Minipool data is undefined. Minipool: " + minipool);
    }

    // Calculate the age of active and exited minipools
    // Use the date of the earliest deposit and the date of the latest withdrawal to calculate the age of the minipool.
    // maxDate does not consider sweapt rewards. Need to rework this to include the sweapt rewards.
    let startDateString = _.minBy(mpDetail.deposits, 'date').date;
    let endDateString = (_.maxBy(mpDetail.withdrawals, 'date') || {}).date || new Date(); // If no withdrawals, use today's date.
    let startDate = new Date(startDateString);  // actual dates
    let endDate = new Date(endDateString);
    let ageInSec = Math.abs(endDate - startDate);
    let days = Math.ceil(ageInSec / (1000 * 60 * 60 * 24)); // age from dates
    //age = Math.floor(age); // Just use the whole days...

    // Set the deposits...
    var totalNOEthDeposited = minipoolData.minipoolStats.node_deposit_balance || 0;
    var totalProtocolEthDeposited = minipoolData.minipoolStats.user_deposit_balance || 0;
    var totalEthDeposited = totalNOEthDeposited + totalProtocolEthDeposited;
    totalNOEthDeposited = (totalNOEthDeposited / 1E18) //convert to gwei
    totalProtocolEthDeposited = (totalProtocolEthDeposited / 1E18)
    totalEthDeposited = (totalEthDeposited / 1E18)
    // Set the withdrawals...
    var totalNOEthWithdrawn = mpDetail.totalWithdrawals || 0;
    var totalProtocolEthWithdrawn = 0;  // Don't have this data yet. Would need to sum over history.
    var totalEthWithdrawn = totalNOEthWithdrawn + totalProtocolEthWithdrawn;

    // Calculate the fiat values of the deposits and withdrawals

    let totalFiatDeposited = mpDetail.deposits.reduce((total, item) => total + (item.amount * item.price_usd), 0) || 0;
    let totalNOFiatDeposited = totalFiatDeposited * (totalNOEthDeposited / totalEthDeposited);
    let totalProtocolFiatDeposited = totalFiatDeposited * (totalProtocolEthDeposited / totalEthDeposited);

    // Set the eth earned...
    var nodeOperatorEthEarned = mpDetail.nodeBalance;
    var protocolEthEarned = mpDetail.protocolBalance;
    var totalEthEarned = Number(nodeOperatorEthEarned) + Number(protocolEthEarned);
    // Fiat gains are the eth earned - eth deposited, times the current price of eth
    const totalFiatGain = ((totalEthEarned + totalEthDeposited) * ethPriceNow) - totalFiatDeposited;
    const protocolFiatGain = ((protocolEthEarned + totalProtocolEthDeposited) * ethPriceNow) - totalProtocolFiatDeposited;
    const nodeOperatorFiatGain = ((nodeOperatorEthEarned + totalNOEthDeposited) * ethPriceNow) - totalNOFiatDeposited;

    //if (totalFiatDeposited > 0) { totalFiatDeposited = totalFiatDeposited - 32000000000 * 2350 } //back out the 32 eth deposit
    let minipoolIndex = minipools.find(pool => pool.validatorIndex === minipool);
    let status = minipoolIndex.status;
    //console.log("Minipool:", minipool, "Minipool Status:", status);
    const eth_apr = ((((365 / days) * totalEthEarned)) / totalEthDeposited).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const no_eth_apr = ((((365 / days) * nodeOperatorEthEarned)) / totalNOEthDeposited).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const p_eth_apr = (((365 / days) * protocolEthEarned) / (totalProtocolEthDeposited)).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fiat_apr = (((365 / days) * totalFiatGain) / (totalFiatDeposited)).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const no_fiat_apr = (((365 / days) * nodeOperatorFiatGain) / (totalNOFiatDeposited)).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const p_fiat_apr = (((365 / days) * protocolFiatGain) / (totalProtocolFiatDeposited)).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const newNodeAPR = {
      nodeAddress: minipoolData.minipoolStats.node_address,
      walletEthDeposited: walletEthDeposited.toFixed(4),
      walletRPLDeposited: walletRPLDeposited.toFixed(4),
      walletEthWithdrawn: walletEthWithdrawn.toFixed(4),
      walletRPLWithdrawn: walletRPLWithdrawn.toFixed(4),
      minipool: minipool,
      status: (status ? "Active" : "Exited"),
      age: days,
      activated: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      exited: (status ? "N/A" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      minipoolEthDeposited: totalEthDeposited.toFixed(4), //Total eth deposited
      minipoolEthWithdrawn: totalEthWithdrawn.toFixed(4), //Total eth withdrawn
      fiat_deposited: totalFiatDeposited.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //Total fiat deposited
      eth_earned: totalEthEarned, //total eth earned by the minipool
      eth_apr: eth_apr,
      fiat_gain: totalFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //Total node's gain
      fiat_apr: fiat_apr
    }; //Total node's apr
    const newNodeOperatorAPR = {
      nodeAddress: minipoolData.minipoolStats.node_address,
      walletEthDeposited: walletEthDeposited.toFixed(4),
      walletRPLDeposited: walletRPLDeposited.toFixed(4),
      walletEthWithdrawn: walletEthWithdrawn.toFixed(4),
      walletRPLWithdrawn: walletRPLWithdrawn.toFixed(4),
      minipool: minipool,
      status: (status ? "Active" : "Exited"),
      age: days,
      activated: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      exited: (status ? "N/A" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      minipoolEthDeposited: totalNOEthDeposited.toFixed(4), //node operators eth deposited
      minipoolEthWithdrawn: totalNOEthWithdrawn.toFixed(4), //node operators eth withdrawn
      fiat_deposited: totalNOFiatDeposited.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //node operators fiat deposited
      eth_earned: nodeOperatorEthEarned, //node operators eth earned
      eth_apr: no_eth_apr, //node operator apr
      fiat_gain: nodeOperatorFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //node operators gain
      fiat_apr: no_fiat_apr
    }; //Total node operator's apr
    const newProtocolAPR = {
      nodeAddress: minipoolData.minipoolStats.node_address,
      walletEthDeposited: walletEthDeposited.toFixed(4),
      walletRPLDeposited: walletRPLDeposited.toFixed(4),
      walletEthWithdrawn: walletEthWithdrawn.toFixed(4),
      walletRPLWithdrawn: walletRPLWithdrawn.toFixed(4),
      minipool: minipool,
      status: (status ? "Active" : "Exited"),
      age: days,
      activated: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      exited: (status ? "N/A" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      minipoolEthDeposited: totalProtocolEthDeposited.toFixed(4), //Protocol eth deposited
      minipoolEthWithdrawn: totalProtocolEthWithdrawn.toFixed(4), //Protocol eth withdrawn
      fiat_deposited: totalProtocolFiatDeposited.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //node operators fiat deposited
      eth_earned: protocolEthEarned, //protocol eth earned
      eth_apr: p_eth_apr, //protocol apr
      fiat_gain: protocolFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //protocol gain
      fiat_apr: p_fiat_apr
    }; ////protocol apr in SD
    //console.log("Added minipool to node APRs:", nodeAPR, nodeOperatorAPR, protocolAPR);
    nodeAPR.push(newNodeAPR);
    nodeOperatorAPR.push(newNodeOperatorAPR);
    protocolAPR.push(newProtocolAPR);
  });

  return { nodeAPR, nodeOperatorAPR, protocolAPR };
}