// Pulling out the caliculation of the APRs from the main app.js file to make it easier to read and maintain.
import _ from "lodash";

export default function calcMinipoolAPRs(walletEthHistory, walletRPLHistory, minipools, minipoolDetails, periodicRewardsShare, ethPriceToday, rplPriceToday) {
  var walletEthDeposited = _.sumBy(walletEthHistory.deposits, "amount") / 1E18;
  var walletEthFiatDeposited = walletEthHistory.deposits.reduce((sum, deposit) => sum + deposit.amount * deposit.price_usd/ 1E18, 0);
  var walletRPLDeposited = _.sumBy(walletRPLHistory.deposits, "amount") / 1E18;
  var walletRPLStaked = minipools[0].minipoolStats.node_rpl_stake / 1E18; //node stats are the same for all minipools
  var walletRPLBalance = walletRPLDeposited - walletRPLStaked;
  var walletEthtoMinipools = _.sumBy(minipools, "bond") / 1E18;
  var walletEthBalance = walletEthDeposited - walletEthtoMinipools;
  var walletRPLFiatDeposited = walletRPLHistory.deposits.reduce((sum, deposit) => sum + deposit.amount * deposit.price_usd/ 1E18, 0);
  var walletRPLFistValue = walletRPLFiatDeposited - walletRPLStaked * rplPriceToday;
  var walletEthWithdrawn = _.sumBy(walletEthHistory.withdrawals, "amount") / 1E18;
  var walletEthFiatWithdrawn = walletEthHistory.withdrawals.reduce((sum, withdrawals) => sum + withdrawals.amount * withdrawals.price_usd/ 1E18, 0);
  var walletRPLWithdrawn = _.sumBy(walletRPLHistory.withdrawals, "amount") / 1E18;
  var walletRPLFiatWithdrawn = walletRPLHistory.withdrawals.reduce((sum, withdrawals) => sum + withdrawals.amount * withdrawals.price_usd/ 1E18, 0);

  //find the minipool indices...
  const uniqueValidatorIndexes = [...new Set(minipools.map(item => item.validatorIndex))];
  // don't think I need this since I saved the list of validators in the from the node API
  //filter the array for each minipool and calculate the IRR
  var walletAPR = [];
  var nodeAPR = [];
  var nodeOperatorAPR = [];
  var protocolAPR = [];

  uniqueValidatorIndexes.forEach(minipool => {
    // need to know what minipool we're working with to fetch the details. 

    let minipoolData = minipools.find(pool => pool.validatorIndex === minipool);
    if (!minipoolData) {
      throw new Error(`No minipool found with validator index: ${minipool}`);
    }

    let mpDetail = minipoolDetails.find(mpDetails => mpDetails.minipoolAddress === minipoolData.minipoolStats.minipool_address);
    if (!mpDetail) {
      throw new Error(`No minipool detail found with address: ${minipoolData.minipoolStats.minipool_address}`);
    }

    let rewards = periodicRewardsShare.find(reward => reward.minipoolAddress === minipoolData.minipoolStats.minipool_address);
    if (!rewards) {
      throw new Error(`No reward found with minipool address: ${minipoolData.minipoolStats.minipool_address}`);
    }

    // if (minipoolData.minipoolStats === undefined) {
    //   throw new Error("Minipool data is undefined. Minipool: " + minipool);
    // }

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
    var nodeOperatorEthEarned = 0;
    var protocolEthEarned = 0;
    var totalEthEarned = 0;
    if (minipoolData.status === true) {
      nodeOperatorEthEarned = Number(mpDetail.nodeBalance);
      protocolEthEarned = Number(mpDetail.protocolBalance);
      totalEthEarned = nodeOperatorEthEarned + protocolEthEarned;
    } else {
      nodeOperatorEthEarned = mpDetail.totalWithdrawals - mpDetail.nodeDepositBalance;
      //don't have these values, so calulate them...
      let commissionRate = Number(minipoolData.minipoolStats.minipool_node_fee);
      protocolEthEarned = (nodeOperatorEthEarned * (1 - commissionRate)) * (totalProtocolEthDeposited / totalNOEthDeposited);
      totalEthEarned = nodeOperatorEthEarned + protocolEthEarned;
    }
    // Fiat gains are the eth earned - eth deposited, times the current price of eth
    const totalFiatGain = ((totalEthEarned + totalEthDeposited) * ethPriceToday) - totalFiatDeposited;
    const protocolFiatGain = ((protocolEthEarned + totalProtocolEthDeposited) * ethPriceToday) - totalProtocolFiatDeposited;
    const nodeOperatorFiatGain = ((nodeOperatorEthEarned + totalNOEthDeposited) * ethPriceToday) - totalNOFiatDeposited;

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
    const newWalletAPR = {
      nodeAddress: minipoolData.minipoolStats.node_address,

      walletEthDeposited: walletEthDeposited.toFixed(4),
      walletEthWithdrawn: walletEthWithdrawn.toFixed(4),
      walletEthtoMinipools: walletEthtoMinipools.toFixed(4),
      walletEthBalance: walletEthBalance.toFixed(4),
      walletEthFiatDeposited: walletEthFiatDeposited.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      walletEthFiatWithdrawn: walletEthFiatWithdrawn.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

      walletRPLDeposited: walletRPLDeposited.toFixed(4),
      walletRPLWithdrawn: walletRPLWithdrawn.toFixed(4),
      walletRPLStaked: walletRPLStaked.toFixed(4),
      walletRPLBalance: walletRPLBalance.toFixed(4),
      walletRPLFiatDeposited: walletRPLFiatDeposited.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      walletRPLFiatWithdrawn: walletRPLFiatWithdrawn.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    }
    const newNodeAPR = {
      minipool: minipool,
      status: (status ? "Active" : "Exited"),
      age: days,
      activated: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      exited: (status ? "N/A" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      minipoolEthDeposited: totalEthDeposited.toFixed(4), //Total eth deposited
      minipoolEthWithdrawn: totalEthWithdrawn.toFixed(4), //Total eth withdrawn
      fiat_deposited: totalFiatDeposited.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //Total fiat deposited
      eth_earned: totalEthEarned.toFixed(4), //total eth earned by the minipool
      eth_apr: eth_apr,
      fiat_gain: totalFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //Total node's gain
      fiat_apr: fiat_apr,
      inflation: 0,
      smoothingPool: 0
    }; //Total node's apr
    const newNodeOperatorAPR = {
      minipool: minipool,
      status: (status ? "Active" : "Exited"),
      age: days,
      activated: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      exited: (status ? "N/A" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      minipoolEthDeposited: totalNOEthDeposited.toFixed(4), //node operators eth deposited
      minipoolEthWithdrawn: totalNOEthWithdrawn.toFixed(4), //node operators eth withdrawn
      fiat_deposited: totalNOFiatDeposited.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //node operators fiat deposited
      eth_earned: nodeOperatorEthEarned.toFixed(4), //node operators eth earned
      eth_apr: no_eth_apr, //node operator apr
      fiat_gain: nodeOperatorFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //node operators gain
      fiat_apr: no_fiat_apr,
      inflation: (rewards.inflationRPLRewards / 1E18).toFixed(4),
      smoothingPool: (rewards.smoothingPoolEthRewards / 1E18).toFixed(4)
    }; //Total node operator's apr
    const newProtocolAPR = {
      minipool: minipool,
      status: (status ? "Active" : "Exited"),
      age: days,
      activated: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      exited: (status ? "N/A" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      minipoolEthDeposited: totalProtocolEthDeposited.toFixed(4), //Protocol eth deposited
      minipoolEthWithdrawn: totalProtocolEthWithdrawn.toFixed(4), //Protocol eth withdrawn
      fiat_deposited: totalProtocolFiatDeposited.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //node operators fiat deposited
      eth_earned: protocolEthEarned.toFixed(4), //protocol eth earned
      eth_apr: p_eth_apr, //protocol apr
      fiat_gain: protocolFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //protocol gain
      fiat_apr: p_fiat_apr,
      inflation: 0,
      smoothingPool: 0
    }; ////protocol apr in SD
    //console.log("Added minipool to node APRs:", nodeAPR, nodeOperatorAPR, protocolAPR);
    walletAPR.push(newWalletAPR); // Only one wallet for now...
    nodeAPR.push(newNodeAPR);
    nodeOperatorAPR.push(newNodeOperatorAPR);
    protocolAPR.push(newProtocolAPR);
  });

  return { walletAPR, nodeAPR, nodeOperatorAPR, protocolAPR };
}