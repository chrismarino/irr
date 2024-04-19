// Pulling out the caliculation of the APRs from the main app.js file to make it easier to read and maintain.
import _ from "lodash";
const { xirr, convertRate } = require('node-irr')

export default function calcWalletFiatIRRs(
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
  let today = new Date().toISOString().slice(0, 10);
  let ethPriceToday = Number(ethPriceHistory[0].price_usd);
  let rplPriceToday = Number(rplPriceHistory[0].price_usd);
  // Prepare the data for the wallet table. Order must match the order in the WalletTable.js file
  var walletEthDeposited = walletEthHistory.deposits.reduce((sum, item) => {
    if (item.amount !== undefined && item.price_usd !== undefined) {
      return sum + (item.amount * item.price_usd) / 1E18;
    } else {
      return sum;
    }
  }, 0);
  var walletRPLDeposited = walletRPLHistory.deposits.reduce((sum, item) => {
    if (item.amount !== undefined && item.price_usd !== undefined) {
      return sum + (item.amount * item.price_usd) / 1E18;
    } else {
      return sum;
    }
  }, 0);

  var walletEthWithdrawn = walletEthHistory.withdrawals.reduce((sum, item) => {
    if (item.amount !== undefined && item.price_usd !== undefined) {
      return sum + (item.amount * item.price_usd) / 1E18;
    } else {
      return sum;
    }
  }, 0);
  var walletRPLWithdrawn = walletRPLHistory.withdrawals.reduce((sum, item) => {
    if (item.amount !== undefined && item.price_usd !== undefined) {
      return sum + (item.amount * item.price_usd) / 1E18;
    } else {
      return sum;
    }
  }, 0);

  var walletEthtoMinipools = _.sumBy(minipools, "bond") / 1E18;
  var walletRPLStaked = stakedRPLDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);

  // This should work, but the price_usd is not set in the stakedRPLDeposits array. Need to fix.
  // var walletRPLStaked_fiatDeposited = stakedRPLDeposits.reduce((sum, item) => sum + (item.amount * item.price_usd) / 1E18, 0);
  // For now, hack with separatet lookups and to fix the array, then run the calc.

  stakedRPLDeposits = stakedRPLDeposits.map(deposit => {
    const matchingPriceHistory = rplPriceHistory.find(history => history.date === deposit.date);
    if (matchingPriceHistory) {
      deposit.price_usd = matchingPriceHistory.price_usd;
    }
    return deposit;
  });
  // Try this again now that the price is set.
  var walletRPLStaked_fiatDeposited = stakedRPLDeposits.reduce((sum, item) => sum + (item.amount * item.price_usd), 0);

  walletEthtoMinipools = walletEthtoMinipools * ethPriceToday;
  walletRPLStaked = walletRPLStaked * rplPriceToday; //current value of stake

  // Hack to calculate the fiat value of fees. Need native wallet values.
  // Estimate. This is not really the fees in fiat since it does not consider timeing of minipool launch. To do..
  var walletEthDeposited_native = walletEthHistory.deposits.reduce((sum, item) => sum + (item.amount) / 1E18, 0);
  var walletEthWithdrawn_native = walletEthHistory.withdrawals.reduce((sum, item) => sum + (item.amount) / 1E18, 0);
  var walletEthBalance_native = Number(nodeDetails.balanceETH);
  var walletEthFees = walletEthDeposited_native - walletEthWithdrawn_native - walletEthBalance_native;;

  walletEthFees = walletEthFees * ethPriceToday;
  var walletRPLFees = 0; // No RPL fees. Included here for consistency.

  var walletEthBalance = Number(nodeDetails.balanceETH) * ethPriceToday;
  var walletRPLBalance = Number(nodeDetails.balanceRPL) * ethPriceToday;
  // get the finalized minipools to calculate the fiat value of returned capital.
  const finalizedMinipoolsDist = minipoolHistory
    .filter(minipool => minipool.isFinalized === true)
    .map(minipool => ({
      nodeDepositBalance: minipool.nodeDepositBalance,
      distributions: minipool.distributions.map(distribution => ({
        amount: distribution.amount,
        date: distribution.date,
        price_usd: distribution.price_usd
      }))
    }));
  const walletEthCapReturned = finalizedMinipoolsDist.reduce((sum, minipool) => {
    const latestDistribution = minipool.distributions.reduce((latest, distribution) => {
      return (!latest || new Date(distribution.date) > new Date(latest.date)) ? distribution : latest;
    }, null);
    return sum + minipool.nodeDepositBalance * latestDistribution.price_usd;
  }, 0);

  var walletRPLCapReturned = 0; // To do...

  // Fiat value of all distributed rewards is the same calc as Return of Capital, but for all minipools.
  // Backing out Return of Capital will leave just the distributed rewards since it will be zero for non-finalized minipools.
  // and non-zero for finalized minipools.

  const totalFiatReturned = minipoolHistory.reduce((sum, minipool) => {
    const distributionSum = minipool.distributions.reduce((distSum, distribution) => {
      return distSum + distribution.amount * distribution.price_usd;
    }, 0);
    return sum + distributionSum;
  }, 0);

  //Add up the total from the minipools.
  var walletEthDistContinuousRewards = totalFiatReturned - walletEthCapReturned;
  var walletRPLDistContinuousRewards = "N/M" // No continuous RPL rewards. Included here for consistency.

  var walletEthUndistContinuousRewards = _.sumBy(minipoolHistory, minipool => Number(minipool.nodeBalance));
  var walletRPLUndistContinuousRewards = "N/M"; // No continuous RPL rewards. Included here for consistency.

  walletEthUndistContinuousRewards = walletEthUndistContinuousRewards * ethPriceToday;
  //walletRPLUndistContinuousRewards = walletRPLUndistContinuousRewards * rplPriceToday;

  var walletEthTotalContinuousRewards = walletEthDistContinuousRewards + walletEthUndistContinuousRewards;
  var walletRPLTotalContinuousRewards = "N/M";

  // Get the flow arrays from the minipool calcs.
  const allContinuousRewardFlows = minipoolNativeIRR.reduce((acc, minipool) => {
    return acc.concat(minipool.continuousRewardsFlows);
  }, []);
  let irrDaily = xirr(allContinuousRewardFlows);

  var walletEthContinuousRewardsIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate
  var walletRPLContinuousRewardsIRR = "N/M"; // No continuous RPL rewards.

  var walletEthClaimedPeriodicRewards = _.sumBy(periodicRewardsShare.claims, "claimedSmoothingPoolEthRewards") / 1E18;
  var walletRPLClaimedPeriodicRewards = _.sumBy(periodicRewardsShare.claims, "claimedInflationRPLRewards") / 1E18;
  walletEthClaimedPeriodicRewards = walletEthClaimedPeriodicRewards * ethPriceToday;
  walletRPLClaimedPeriodicRewards = walletRPLClaimedPeriodicRewards * rplPriceToday;

  var walletEthUnclaimedPeriodicRewards = _.sumBy(periodicRewardsShare, "smoothingPoolEthRewards") / 1E18;
  var walletRPLTotalPeriodicRewards = _.sumBy(periodicRewardsShare, "inflationRPLRewards") / 1E18;
  walletEthUnclaimedPeriodicRewards = walletEthUnclaimedPeriodicRewards * ethPriceToday;
  walletRPLTotalPeriodicRewards = walletRPLTotalPeriodicRewards * rplPriceToday;
  // balaces are already in fiat
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
  //const rplDepositFlows = walletRPLHistory.deposits.map(({ amount, date }) => ({ amount: (amount * price_usd) / (-1E18), date }))
  //const rplWithdrawalFlows = walletRPLHistory.withdrawals.map(({ amount, price_usd, date }) => ({ amount: amount / 1E18, date }))

  const rplDepositFlows = walletRPLHistory.deposits.map(({ amount, price_usd, date }) => ({
    amount: (-1 * amount * price_usd) / 1E18,
    date: date
  }));
  const rplWithdrawalFlows = walletRPLHistory.withdrawals.map(({ amount, price_usd, date }) => ({
    amount: (amount * price_usd) / 1E18,
    date: date
  }));
  const rplStakeFlows = stakedRPLDeposits.map(({ amount, price_usd, date }) => ({
    amount: (-1 * amount * price_usd),
    date: date
  }));
  //const rplStakeFlows = stakedRPLDeposits.map(({ amount, date }) => ({ amount: -1 * amount, date }))
  const rplTotal = walletRPLBalance + walletRPLUnclaimedPeriodicRewards + walletRPLStaked
  const rplUnclaimed = [{ amount: rplTotal, date: today }];
  const rplClaimedFlows = getAmountsAndDates(nodePeriodicRewards);
  const rplFlows = rplDepositFlows.concat(rplWithdrawalFlows, rplStakeFlows, rplClaimedFlows, rplUnclaimed);
  irrDaily = xirr(rplFlows);
  var walletRPLPeriodicRewardsIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate

  var walletEthTotalRewards = walletEthTotalPeriodicRewards + walletEthTotalContinuousRewards;
  var walletRPLTotalRewards = walletRPLTotalPeriodicRewards; // No continuous RPL rewards. 

  var walletEthTotalNodeBalance = walletEthtoMinipools + walletEthBalance + walletEthTotalContinuousRewards + walletEthTotalPeriodicRewards;
  var walletRPLTotalNodeBalance = walletRPLStaked + walletRPLBalance + walletRPLTotalPeriodicRewards;


  //const ethDepositFlowsx = walletEthHistory.deposits.map(({ amount, date }) => ({ amount: -1 * amount, date }))
  //const ethWithdrawalFlows = walletEthHistory.withdrawals.map(({ amount, date }) => ({ amount: -1 * amount, date }))
  const allEthFlows = minipoolFiatIRR.reduce((acc, minipool) => {
    return acc.concat(minipool.totalEthFlows);
  }, []);
  irrDaily = xirr(allEthFlows);
  var walletEthIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate
  var walletRPLIRR = walletRPLPeriodicRewardsIRR; // No other sources of RPL rewards.
  // Fiat eth gains will the sum for all minipools.
  var walletEthTotalGain = minipoolFiatIRR.reduce((sum, minipool) => {
    return sum + Number(minipool.totalEthGain.replace(/[$,]/g, ''));  // uses a string from the other calc. could be better.
  }, 0);
  // RPL Total fiat gain is the fiat value of the rewards, the change in fiat value of the RPL stake plus
  // the fiat value of the net deposits and withdrawals to the wallet to account for timing of staking.
  var walletRPLTotalGain = walletRPLTotalRewards + (walletRPLStaked - walletRPLStaked_fiatDeposited) +
    (walletRPLWithdrawn - walletRPLDeposited);


  var fiatIRR = [];


  const newIRR = {  //the order of these fields must match the order in the WalletTable.js file
    nodeAddress: minipools[0].minipoolStats.node_address,

    currentEthPrice: ethPriceToday.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    currentRPLPrice: rplPriceToday.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthDeposited: walletEthDeposited.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLDeposited: walletRPLDeposited.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthWithdrawn: walletEthWithdrawn.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLWithdrawn: walletRPLWithdrawn.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthtoMinipools: walletEthtoMinipools.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLStaked: walletRPLStaked.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthFees: walletEthFees.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLFees: walletRPLFees.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthBalance: walletEthBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLBalance: walletRPLBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthCapReturned: walletEthCapReturned.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLCapReturned: walletRPLCapReturned.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthDistContinuousRewards: walletEthDistContinuousRewards.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLDistContinuousRewards: walletRPLDistContinuousRewards, // This is set to zero for now

    walletEthUndistContinuousRewards: walletEthUndistContinuousRewards.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLUndistContinuousRewards: walletRPLUndistContinuousRewards,  // This is set to zero for now

    walletEthTotalContinuousRewards: walletEthTotalContinuousRewards.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLTotalContinuousRewards: walletRPLTotalContinuousRewards, // This is set to zero for now

    walletEthContinuousRewardsIRR: walletEthContinuousRewardsIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    walletRPLContinuousRewardsIRR: walletRPLContinuousRewardsIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),

    walletEthClaimedPeriodicRewards: walletEthClaimedPeriodicRewards.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLClaimedPeriodicRewards: walletRPLClaimedPeriodicRewards.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthUnclaimedPeriodicRewards: walletEthUnclaimedPeriodicRewards.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLUnclaimedPeriodicRewards: walletRPLUnclaimedPeriodicRewards.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthTotalPeriodicRewards: walletEthTotalPeriodicRewards.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLTotalPeriodicRewards: walletRPLTotalPeriodicRewards.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthPeriodicRewardsIRR: walletEthPeriodicRewardsIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    walletRPLPeriodicRewardsIRR: walletRPLPeriodicRewardsIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),

    walletEthTotalRewards: walletEthTotalRewards.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLTotalRewards: walletRPLTotalRewards.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthTotalNodeBalance: walletEthTotalNodeBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLTotalNodeBalance: walletRPLTotalNodeBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthTotalGain: walletEthTotalGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    walletRPLTotalGain: walletRPLTotalGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),

    walletEthIRR: walletEthIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    walletRPLIRR: walletRPLIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  }

  //("Added minipool to node APRs:", minipoolNativeIRR);
  fiatIRR.push(newIRR); // Only one wallet for now...

  return fiatIRR;
}

function getAmountsAndDates(nodePeriodicRewards) {
  return nodePeriodicRewards.map(reward => ({
    amount: reward.collateralRpl / 1E18,
    date: new Date(reward.endTime * 1000).toISOString().slice(0, 10), // Assuming endTime is in seconds
  }));
}