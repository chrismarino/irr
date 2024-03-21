import { ListItem } from "@mui/material";
import _ from "lodash";
export default function calcPeriodicRewardsShare(nodePeriodicRewards, minipoolDetails) {
    // a function that determines if a minipool was active during a reward period and assignes a share of the Smoothing Pool and 
    // Inflation rewards to that minipool. Share base on the number of days the minipool was active during the reward period, and
    // the minipool's stake. Returnd an array of objects with the minipool, share and rewards.
    // Uses timestamp (not dates) of minipool creation and end of reward period to determine if minipool was 
    // active during the reward period.
    if (nodePeriodicRewards.length === 0 || !minipoolDetails) return;
    let interval = nodePeriodicRewards.map(interval => ({
        interval: interval.rewardIndex,
        endTime: interval.endTime,
        startTime: interval.endTime - (28 * 86400), // 86400 seconds in a day
        smootingPoolEthRewards: interval.smoothingPoolEth,
        inflationRPLRewards: interval.collateralRpl,
    }));
    let minipools = minipoolDetails.map(minipool => ({
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
                    smoothingPoolEthRewards: interval.smootingPoolEthRewards,
                    inflationRPLRewards: interval.inflationRPLRewards,
                    days: intervalDays / 86400,
                    depositWeightedDays: depositWeightedDays / 86400
                });
            }
        });
        return {
            minipoolAddress: minipool.minipoolAddress,
            activeDays,
            activeIntervals,
        };

        // Sum the rewards for the minipool across the intervals

    });
    // Addup all the weighted days for the minipool.
    let intervalsWithTotalDepositWeightedDays = [];
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
            totalInflationRPLRewards: intervalElement.inflationRPLRewards,
            totalSmootingPoolEthRewards: intervalElement.smootingPoolEthRewards,
            totalDepositWeightedDays
        });
    });
    // update the active intervals with the total deposit weighted days and
    // calculate the minipool's share of the rewards.
    if (rewards.length > 0) {
        rewards.forEach(reward => {
            reward.activeIntervals = reward.activeIntervals.map(activeInterval => {
                let matchingInterval = intervalsWithTotalDepositWeightedDays.find(interval => interval.interval === activeInterval.interval);
                if (matchingInterval) {
                    return {
                        ...activeInterval,
                        minipoolShare: activeInterval.depositWeightedDays / matchingInterval.totalDepositWeightedDays,
                        inflationRPLShare: activeInterval.depositWeightedDays / matchingInterval.totalDepositWeightedDays * matchingInterval.totalInflationRPLRewards,
                        smoothingPoolEthShare: activeInterval.depositWeightedDays / matchingInterval.totalDepositWeightedDays * matchingInterval.totalSmootingPoolEthRewards,
                        totalDepositWeightedDays: matchingInterval.totalDepositWeightedDays
                    };
                }
                return activeInterval;
            });
        });

    }
    // Add up the minipool's share of the rewards across the intervals.
    rewards = rewards.map(reward => {
        let smoothingPoolEthRewards = reward.activeIntervals.reduce((sum, activeInterval) => sum + activeInterval.smoothingPoolEthShare, 0);
        let inflationRPLRewards = reward.activeIntervals.reduce((sum, activeInterval) => sum + activeInterval.inflationRPLShare, 0);

        return {
            ...reward,
            smoothingPoolEthRewards,
            inflationRPLRewards
        };
    });
    return ({
        minipoolAddress: rewards.minipoolAddress,
        smoothingPoolEthRewards: rewards.smoothingPoolEthRewards,
        inflationRPLRewards: rewards.inflationRPLRewards,
    });
}