import { ListItem } from "@mui/material";
import _ from "lodash";
import { min } from "moment";
export default function calcPeriodicRewardsShare(nodePeriodicRewards, minipoolHistory, walletRPLHistory) {
    // a function that determines if a minipool was active during a reward period and assignes a share of the Smoothing Pool and 
    // Inflation rewards to that minipool. Share based on the number of days the minipool was active during the reward period, and
    // the minipool's stake. Returns an array of objects with the minipool, share, rewards and APR. APR is calculated based on the
    // minipool's share of the rewards over the number of days the minipool was active during the reward period.
    // Uses timestamp (not dates) of minipool creation and end of reward period to determine if minipool was 
    // active during the reward period.
    if (typeof walletRPLHistory === 'string') return;
    if (nodePeriodicRewards.length === 0 || !minipoolHistory || walletRPLHistory.length === 0 || !walletRPLHistory.withdrawals) return;
    let interval = nodePeriodicRewards.map(interval => {
        let endTime = interval.endTime;
        let startTime = interval.endTime - (28 * 86400); // 86400 seconds in a day
        let RPLBalanceStart;
        let RPLBalanceEnd;
        // Get the RPL balance at the start and end of the interval from the node wallet history.  Can't use the
        // balance because we need the balance at different times over the life of the node.
        // NOTE: This is wrong. It uses wallet history, not staked history. Need to fix. It will work
        // when staking only occured from the wallet.
        try {
            RPLBalanceStart = walletRPLHistory.withdrawals
                .filter(withdrawal => new Date(withdrawal.date) < new Date((startTime) * 1000))
                .reduce((staked, withdrawal) => staked + withdrawal.amount, 0);
        } catch (error) {
            console.error(`Failed to calculate RPLBalanceStart: ${error}`);

        }
        try {
            RPLBalanceEnd = walletRPLHistory.withdrawals
                .filter(withdrawal => new Date(withdrawal.date) < new Date(endTime * 1000))
                .reduce((staked, withdrawal) => staked + withdrawal.amount, 0);
        } catch (error) {
            console.error(`Failed to calculate RPLBalanceEnd: ${error}`);

        }
        return {
            // Return an array that has the interval nunber, start and end times, the start and end balances and
            // and the rewards for the interval. (Where is Smoothing Pool Eth balances? I think that's missing)
            interval: interval.rewardIndex,
            endTime: endTime,
            startTime: startTime,
            isClaimed: interval.isClaimed,
            smoothingPoolEthRewards: interval.smoothingPoolEth,
            inflationRPLRewards: interval.collateralRpl,
            RPLBalanceStart: RPLBalanceStart,
            RPLBalanceEnd: RPLBalanceEnd
        };
    });
    // Create an array with the minipool address, start and end times and the node deposit (i.e. bond) for that minipool
    let minipools = minipoolHistory.map(minipool => ({
        minipoolAddress: minipool.minipoolAddress,
        startTime: minipool.statusTime.toNumber(),
        endTime: (_.maxBy(minipool.withdrawals, 'timeStamp') || {}).timeStamp || Math.floor(Date.now() / 1000), // If no withdrawals, use today's date.
        nodeDeposit: minipool.nodeDepositBalance,
    }));
    // Find which minipools were active during the reward period interval.
    let rewards = minipools.map(minipool => {
        let activeDays = 0;
        let intervalDays = 0;
        let depositWeightedDays = 0;
        let activeIntervals = [];
        interval.forEach(interval => {
            if (minipool.startTime < interval.endTime && minipool.endTime > interval.startTime) {
                intervalDays = Math.min(minipool.endTime, interval.endTime) - Math.max(minipool.startTime, interval.startTime);
                depositWeightedDays = intervalDays * minipool.nodeDeposit;
                activeDays += intervalDays;
                activeIntervals.push({
                    interval: interval.interval,
                    smoothingPoolEthRewards: interval.smoothingPoolEthRewards,
                    inflationRPLRewards: interval.inflationRPLRewards,
                    days: intervalDays / 86400,
                    depositWeightedDays: depositWeightedDays / 86400,
                    RPLBalanceEnd: interval.RPLBalanceEnd,
                    RPLBalanceStart: interval.RPLBalanceStart
                });
            }
        });
        return {
            // Return an array with the minipool address, the number of days the minipool was active during the reward period, along
            // with an array of activeIntervals includes the interval number, the Smoothing Pool Eth rewards, the Inflation RPL rewards,
            // the number of days the minipool was active during the interval and the deposit-weighted days for the interval. 
            // The RPL balance and start and end of interval is also included. (I think we also need Eth rewards here.)
            minipoolAddress: minipool.minipoolAddress,
            activeDays,
            activeIntervals,
        };

    // Sum the rewards for the minipool across the intervals. Also calcuate the total Eth and RPL claimed...
    });
    // Add up all the weighted days and claimed rewards for the minipool.
    let intervalsWithTotalDepositWeightedDays = [];
    //let xxx = rewards;
    interval.forEach(intervalElement => {
        let totalDepositWeightedDays = rewards.reduce((sum, reward) => {
            reward.activeIntervals.forEach(activeInterval => {
                if (activeInterval.interval === intervalElement.interval) {
                    sum += activeInterval.depositWeightedDays;
                }
            });
            return sum;
        }, 0);

        intervalsWithTotalDepositWeightedDays.push({
            interval: intervalElement.interval,
            RPLBalanceEnd: intervalElement.RPLBalanceEnd,
            RPLBalanceStart: intervalElement.RPLBalanceStart,
            totalInflationRPLRewards: intervalElement.inflationRPLRewards,
            inflationRPLClaimed: intervalElement.isClaimed ? intervalElement.inflationRPLRewards : 0,
            smoothingPoolEthClaimed: intervalElement.isClaimed ? intervalElement.smoothingPoolEthRewards : 0,
            totalSmoothingPoolEthRewards: intervalElement.smoothingPoolEthRewards,
            totalDepositWeightedDays,
        });
    });
    // update the active intervals with the total deposit weighted days and
    // calculate the minipool's share of the rewards.
    if (rewards.length > 0) {
        rewards.forEach(reward => {
            reward.activeIntervals = reward.activeIntervals.map(activeInterval => {
                let matchingInterval = intervalsWithTotalDepositWeightedDays.find(interval => interval.interval === activeInterval.interval);
                if (matchingInterval) {
                    let minipoolShare = activeInterval.depositWeightedDays / matchingInterval.totalDepositWeightedDays;
                    let inflationRPLShare = minipoolShare * matchingInterval.totalInflationRPLRewards;
                    let inflationRPLClaimed = minipoolShare * matchingInterval.inflationRPLClaimed;
                    let smoothingPoolEthClaimed = minipoolShare * matchingInterval.smoothingPoolEthClaimed;
                    let smoothingPoolEthShare = minipoolShare * matchingInterval.totalSmoothingPoolEthRewards;
                    let minipoolRPLShare = minipoolShare * matchingInterval.RPLBalanceEnd;
                    let intervalReturn = inflationRPLShare / minipoolRPLShare;
                    return {
                        ...activeInterval,
                        minipoolShare: minipoolShare,
                        minipoolRPLShare: minipoolRPLShare,
                        intervalReturn: intervalReturn,
                        inflationRPLShare: inflationRPLShare,
                        inflationRPLClaimed: inflationRPLClaimed,
                        smoothingPoolEthClaimed: smoothingPoolEthClaimed,
                        smoothingPoolEthShare: smoothingPoolEthShare,
                        totalDepositWeightedDays: matchingInterval.totalDepositWeightedDays
                    };
                }
                return activeInterval;
            });
        });

    }
    // Add up the minipool's share of the rewards and claims across the intervals.
    rewards = rewards.map(reward => {
        let smoothingPoolEthRewards = reward.activeIntervals.reduce((sum, activeInterval) => sum + activeInterval.smoothingPoolEthShare, 0);
        let claimedSmoothingPoolEthRewards = reward.activeIntervals.reduce((sum, activeInterval) => sum + activeInterval.smoothingPoolEthClaimed, 0);
        let claimedInflationRPLRewards = reward.activeIntervals.reduce((sum, activeInterval) => sum + activeInterval.inflationRPLClaimed, 0);
        let inflationRPLRewards = reward.activeIntervals.reduce((sum, activeInterval) => sum + activeInterval.inflationRPLShare, 0);
        let totalRPLShares = reward.activeIntervals.reduce((sum, activeInterval) => sum + activeInterval.intervalReturn, 0);
        let activeDays = reward.activeIntervals.reduce((sum, activeInterval) => sum + activeInterval.days, 0);
        let minipoolInflationAPR = (totalRPLShares * 365) / activeDays;
        return {
            minipoolAddress: reward.minipoolAddress,
            smoothingPoolEthRewards,
            claimedSmoothingPoolEthRewards,
            claimedInflationRPLRewards,
            inflationRPLRewards,
            minipoolInflationAPR
        };
    });
    return rewards;
}