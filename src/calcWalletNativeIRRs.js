// Pulling out the caliculation of the APRs from the main app.js file to make it easier to read and maintain.
import _ from "lodash";
const { xirr, convertRate } = require('node-irr')

export default function calcWalletNativeIRRs(
  walletEthHistory,
  walletRPLHistory,
  minipools,
  minipoolHistory,
  periodicRewardsShare,
  ethPriceHistory,
  rplPriceHistory,
  stakedRPLDeposits,
  minipoolNativeIRR,
  minipoolFiatIRR,
  nodePeriodicRewards,
  nodeDetails) {
  let ethPriceToday = Number(ethPriceHistory[0].price_usd);
  let rplPriceToday = Number(rplPriceHistory[0].price_usd);
  let today = new Date().toISOString().slice(0, 10);
  // Prepare the data for the wallet table. Order must match the order in the WalletTable.js file
  var walletEthDeposited = _.sumBy(walletEthHistory.deposits, "amount") / 1E18;
  var walletRPLDeposited = _.sumBy(walletRPLHistory.deposits, "amount") / 1E18;

  var walletEthWithdrawn = _.sumBy(walletEthHistory.withdrawals, "amount") / 1E18;
  var walletRPLWithdrawn = _.sumBy(walletRPLHistory.withdrawals, "amount") / 1E18;

  var walletEthtoMinipools = _.sumBy(minipools, "bond") / 1E18;
  var walletRPLStaked = stakedRPLDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);

  var walletEthBalance = Number(nodeDetails.balanceETH);
  var walletRPLBalance = Number(nodeDetails.balanceRPL);
//Find the exited minipools and get their returned capital and the date of the exit to calculate fiat value of returned capital
  var walletEthCapReturned = (minipools.reduce((sum, minipool) => minipool.status === false ? sum + Number(minipool.bond) : sum, 0))/1E18;
  var walletRPLCapReturned = 0; // set to zero for now. Not sure hot to handel this yet.

  var walletEthFees = walletEthDeposited - walletEthWithdrawn - walletEthBalance;;
  var walletRPLFees = walletRPLDeposited - walletRPLWithdrawn - walletRPLBalance;

  var walletEthDistContinuousRewards = minipoolNativeIRR.reduce((sum, minipool) => sum + (+minipool.continuousRewardsDistributed), 0);
  var walletRPLDistContinuousRewards = "N/M" // No continuous RPL rewards. Included here for consistency.

  var walletEthUndistContinuousRewards = _.sumBy(minipoolHistory, minipool => Number(minipool.nodeBalance));
  var walletRPLUndistContinuousRewards = "N/M"; // No continuous RPL rewards. Included here for consistency.

  var walletEthTotalContinuousRewards = walletEthDistContinuousRewards + walletEthUndistContinuousRewards;
  var walletRPLTotalContinuousRewards = "N/M";
  // Get the flow arrays from the minipool calcs.
  const allContinuousRewardFlows = minipoolNativeIRR.reduce((acc, minipool) => {
    return acc.concat(minipool.continuousRewardsFlows);
  }, []);
  let irrDaily = xirr(allContinuousRewardFlows);

  var walletEthContinuousRewardsIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate
  var walletRPLContinuousRewardsIRR = "N/M"; // No continuous RPL rewards.

  var walletEthClaimedPeriodicRewards = _.sumBy(periodicRewardsShare, "claimedSmoothingPoolEthRewards") / 1E18;
  var walletRPLClaimedPeriodicRewards = _.sumBy(periodicRewardsShare, "claimedInflationRPLRewards") / 1E18;

  var walletEthUnclaimedPeriodicRewards = _.sumBy(periodicRewardsShare, "smoothingPoolEthRewards") / 1E18;
  var walletRPLTotalPeriodicRewards = _.sumBy(periodicRewardsShare, "inflationRPLRewards") / 1E18;

  var walletEthTotalPeriodicRewards = walletEthClaimedPeriodicRewards + walletEthUnclaimedPeriodicRewards;
  var walletRPLUnclaimedPeriodicRewards = walletRPLTotalPeriodicRewards - walletRPLClaimedPeriodicRewards;

  const allPeriodicRewardEthFlows = minipoolNativeIRR.reduce((acc, minipool) => {
    return acc.concat(minipool.smoothingPoolFlows);
  }, []);
  irrDaily = xirr(allPeriodicRewardEthFlows);
  var walletEthPeriodicRewardsIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate

  // RPL IRR is the IRR of interval rewards distributed and the staked RPL deposits, with an terminal value that
  // includes the unclaimed rewards.
  //const rplFlows = minipoolNativeIRR.reduce((acc, minipool) => {
  const rplDepositFlows = walletRPLHistory.deposits.map(({ amount, date }) => ({ amount: amount / (-1E18), date }))
  const rplWithdrawalFlows = walletRPLHistory.withdrawals.map(({ amount, date }) => ({ amount: amount / 1E18, date }))
  const rplStakeFlows = stakedRPLDeposits.map(({ amount, date }) => ({ amount: -1 * amount, date }))
  const rplTotal = walletRPLBalance + walletRPLUnclaimedPeriodicRewards + walletRPLStaked
  const rplUnclaimed = [{ amount: rplTotal, date: today }];
  const rplClaimedFlows = getAmountsAndDates(nodePeriodicRewards);
  const rplFlows = rplDepositFlows.concat(rplWithdrawalFlows, rplStakeFlows, rplUnclaimed, rplClaimedFlows);
  irrDaily = xirr(rplFlows);
  var walletRPLPeriodicRewardsIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate

  var walletEthTotalRewards = walletEthTotalPeriodicRewards + walletEthTotalContinuousRewards;
  var walletRPLTotalRewards = walletRPLTotalPeriodicRewards; // No continuous RPL rewards. 

  var walletEthTotalNodeBalance = walletEthtoMinipools + walletEthBalance + walletEthUndistContinuousRewards + walletEthUnclaimedPeriodicRewards;
  var walletRPLTotalNodeBalance = walletRPLStaked + walletRPLBalance + walletRPLUnclaimedPeriodicRewards;


  //const ethDepositFlowsx = walletEthHistory.deposits.map(({ amount, date }) => ({ amount: -1 * amount, date }))
  //const ethWithdrawalFlows = walletEthHistory.withdrawals.map(({ amount, date }) => ({ amount: -1 * amount, date }))
  const allEthFlows = minipoolNativeIRR.reduce((acc, minipool) => {
    return acc.concat(minipool.totalEthFlows);
  }, []);
  irrDaily = xirr(allEthFlows);
  var walletEthIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate
  var walletRPLIRR = walletRPLPeriodicRewardsIRR; // No other sources of RPL rewards.
  var walletEthTotalGain = walletEthTotalRewards ; //  For native, these are the same. For fiat they include change in currency price
  var walletRPLTotalGain = walletRPLTotalRewards;

  var nativeIRR = [];

  const newIRR = {  //the order of these fields must match the order in the WalletTable.js file
    nodeAddress: minipools[0].minipoolStats.node_address,

    currentEthPrice: ethPriceToday.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    currentRPLPrice: rplPriceToday.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthDeposited: walletEthDeposited.toFixed(4),
    walletRPLDeposited: walletRPLDeposited.toFixed(4),

    walletEthWithdrawn: walletEthWithdrawn.toFixed(4),
    walletRPLWithdrawn: walletRPLWithdrawn.toFixed(4),

    walletEthtoMinipools: walletEthtoMinipools.toFixed(4),
    walletRPLStaked: walletRPLStaked.toFixed(4),

    walletEthFees: walletEthFees.toFixed(4),
    walletRPLFees: walletRPLFees.toFixed(4),

    walletEthBalance: walletEthBalance.toFixed(4),
    walletRPLBalance: walletRPLBalance.toFixed(4),

    walletEthCapReturned: walletEthCapReturned.toFixed(4),
    walletRPLCapReturned: walletRPLCapReturned.toFixed(4),

    walletEthDistContinuousRewards: walletEthDistContinuousRewards.toFixed(4),
    walletRPLDistContinuousRewards: walletRPLDistContinuousRewards, // Not Meaninful

    walletEthUndistContinuousRewards: walletEthUndistContinuousRewards.toFixed(4),
    walletRPLUndistContinuousRewards: walletRPLUndistContinuousRewards,  // Not Meaninful

    walletEthTotalContinuousRewards: walletEthTotalContinuousRewards.toFixed(4),
    walletRPLTotalContinuousRewards: walletRPLTotalContinuousRewards, // Not Meaninful

    walletEthContinuousRewardsIRR: walletEthContinuousRewardsIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    walletRPLContinuousRewardsIRR: walletRPLContinuousRewardsIRR, // Not Meaninful

    walletEthClaimedPeriodicRewards: walletEthClaimedPeriodicRewards.toFixed(4),
    walletRPLClaimedPeriodicRewards: walletRPLClaimedPeriodicRewards.toFixed(4),

    walletEthUnclaimedPeriodicRewards: walletEthUnclaimedPeriodicRewards.toFixed(4),
    walletRPLUnclaimedPeriodicRewards: walletRPLUnclaimedPeriodicRewards.toFixed(4),

    walletEthTotalPeriodicRewards: walletEthTotalPeriodicRewards.toFixed(4),
    walletRPLTotalPeriodicRewards: walletRPLTotalPeriodicRewards.toFixed(4),

    walletEthPeriodicRewardsIRR: walletEthPeriodicRewardsIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    walletRPLPeriodicRewardsIRR: walletRPLPeriodicRewardsIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),

    walletEthTotalRewards: walletEthTotalRewards.toFixed(4),
    walletRPLTotalRewards: walletRPLTotalRewards.toFixed(4),

    walletEthTotalNodeBalance: walletEthTotalNodeBalance.toFixed(4),
    walletRPLTotalNodeBalance: walletRPLTotalNodeBalance.toFixed(4),

    walletEthTotalGain: walletEthTotalGain.toFixed(4),
    walletRPLTotalGain: walletRPLTotalGain.toFixed(4),

    walletEthIRR: walletEthIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    walletRPLIRR: walletRPLIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  }

  //console.log("Added minipool to node APRs:", totalNodeAPR, nodeOperatorAPR, minipoolNativeIRR);
  nativeIRR.push(newIRR); // Only one wallet for now...

  return nativeIRR;
}

function getAmountsAndDates(nodePeriodicRewards) {
  return nodePeriodicRewards.map(reward => ({
    amount: reward.collateralRpl / 1E18,
    date: new Date(reward.endTime * 1000).toISOString().slice(0, 10), // Assuming endTime is in seconds
  }));
}