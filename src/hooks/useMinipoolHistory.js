import useK from "./useK";
import { useWebSocketProvider } from "wagmi";
import _ from "lodash";
import { ethers } from "ethers";
import contracts from "../contracts";
import { useQueries } from "react-query";
import { useContext } from 'react';
import DataContext from '../components/DataContext';

export default function useMinipoolHistory(nodeAddress, ethPriceHistory) {
  const { setProgressStatus, setDone } = useContext(DataContext);
  let { data: minipools } = useK.RocketMinipoolManager.Find.MinipoolCreated({
    args: [null, nodeAddress],
    from: 0,
    to: "latest",
  });
  let provider = useWebSocketProvider();
  let minipoolAddresses = _.uniq(
    (minipools || []).map(({ args: [minipoolAddress] }) => minipoolAddress)
  );
  let mpDelegateInterface = new ethers.utils.Interface(
    contracts.RocketMinipoolDelegate.abi
  );
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  // For very large nodes we can't load all minipools at once without hitting rate limits.
  // But most nodes are smaller and they can be loaded at once.
  // So we aggressively load the first minipools for a node and then spread out the remainder.
  // Thus, most nodes load right away and larger nodes load over a predictable loading window.

  // Note: these numbers are experimentally derived and may need tweaking as the `queryFn` changes.
  // Load this many minipools immediately without spreading out the load.
  let loadingWindowBypassCount = 1;
  // Spread out any remaining minipool loads over this-sized window of time.
  let loadingWindowMs = 1 * 1000; // 1 seconds
  let details = [];


  details = useQueries(
    minipoolAddresses.map(
      (minipoolAddress, i) => ({
        queryKey: ["MinipoolHistory", minipoolAddress],
        queryFn: async () => {
          // Spread out load for large nodes.
          if (i > loadingWindowBypassCount) {
            await new Promise((resolve) =>
              setTimeout(resolve, loadingWindowMs * Math.random())
            );
          }
          //setProgressStatus({totalMinipools: minipools.length, processed: i+1});
          const mp = new ethers.Contract(
            minipoolAddress,
            mpDelegateInterface,
            provider?.signer || provider
          );
          // Note: we don't Promise.all these reads to be gentler on the rate-limit.
          // TODO: issue a multi-read call instead.
          // get the events for the minipool
          const filterWithdrawn = mp.filters.EtherWithdrawn(null, null);
          const filterDeposited = mp.filters.EtherDeposited(null, null);
          const etherWithdrawnEvents = await mp.queryFilter(filterWithdrawn);
          const etherDepositedEvents = await mp.queryFilter(filterDeposited);
          // fetch the events for the minipool put them in a try/catch block
          let distributions = [];
          let deposits = [];
          try {
            distributions = await Promise.all(etherWithdrawnEvents.map(async (log) => {
              const { name, args } = mpDelegateInterface.parseLog(log);

              // Convert args
              const amount = Number(args.amount) / 1E18;
              let timeStamp = args.time.toNumber();
              let date = new Date(args.time * 1000);
              date = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
              // Need YYYY-MM-DD format for getPriceOnDate
              let price_usd = ethPriceHistory.find(price => price.date === date)?.price_usd;
              return { name, timeStamp, date, amount, price_usd };
            }));
            await delay(500);
            deposits = await Promise.all(etherDepositedEvents.map(async (log) => {
              const { name, args } = mpDelegateInterface.parseLog(log);

              // Convert args
              const amount = Number(args.amount) / 1E18;
              let timeStamp = args.time.toNumber();
              let date = new Date(args.time * 1000);
              date = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
              // Need YYYY-MM-DD format for getPriceOnDate
              let price_usd = ethPriceHistory.find(price => price.date === date)?.price_usd;
              return { name, timeStamp, date, amount, price_usd };
            }));
          } catch (error) {
            if (error.response && error.response.status === 429) {
              console.log('Hit rate limit: ', error);
            } else {
              console.error("Failed getting minipool deposit and withdrawal events:", error);
            }
          }
          // get the details for the minipool
          let isFinalized = await mp.getFinalised();
          let nodeRefundBalance = await mp.getNodeRefundBalance();
          let version = await mp.version();
          let status = await mp.getStatus();
          let statusTime = await mp.getStatusTime();
          //let minipoolIndex = await mp._index;
          let nodeDepositBalance = await mp.getNodeDepositBalance();
          let nodeFee = await mp.getNodeFee();
          let mpBalance = await provider.getBalance(minipoolAddress);

          let balanceLessRefund = mpBalance.sub(nodeRefundBalance);
          let calculatedNodeShare = ethers.constants.Zero;
          if (balanceLessRefund.gt(ethers.constants.Zero)) {
            calculatedNodeShare = await mp.calculateNodeShare(balanceLessRefund);
          }
          let nodeBalance = ethers.BigNumber.from(nodeRefundBalance || "0").add(
            ethers.BigNumber.from(calculatedNodeShare || "0")
          );
          let protocolBalance = mpBalance.sub(nodeBalance);
          mpBalance = mpBalance.toHexString();
          nodeDepositBalance = nodeDepositBalance.toHexString();
          nodeFee = nodeFee.toHexString();
          nodeRefundBalance = nodeRefundBalance.toHexString();
          calculatedNodeShare = calculatedNodeShare.toHexString();
          nodeBalance = nodeBalance.toHexString();
          protocolBalance = protocolBalance.toHexString();
          let totalDistributions = distributions ? _.sumBy(distributions, 'amount') : 0;
          let totalDeposits = deposits ? _.sumBy(deposits, 'amount') : 0;
          //console.log("minipool", minipoolAddress, "distributions", distributions, "deposits", deposits);
          // parse the events so we can display them in the UI
          mpBalance = parseFloat(ethers.utils.formatEther(mpBalance || 0)).toFixed(6);
          nodeFee = parseFloat(ethers.utils.formatEther(nodeFee || 0)).toFixed(6);
          nodeDepositBalance = parseFloat(ethers.utils.formatEther(nodeDepositBalance || 0)).toFixed(6);
          nodeRefundBalance = parseFloat(ethers.utils.formatEther(nodeRefundBalance || 0)).toFixed(6);
          calculatedNodeShare = parseFloat(ethers.utils.formatEther(calculatedNodeShare || 0)).toFixed(6);
          nodeBalance = parseFloat(ethers.utils.formatEther(nodeBalance || 0)).toFixed(6);
          protocolBalance = parseFloat(ethers.utils.formatEther(protocolBalance || 0)).toFixed(6);
          let upgraded = version > 2;
          minipoolAddress = String(minipoolAddress).toLowerCase();
          try {
            return {
              minipoolAddress,
              mpBalance,
              nodeDepositBalance,
              nodeRefundBalance,
              calculatedNodeShare,
              nodeBalance,
              nodeFee,
              protocolBalance,
              status,
              statusTime,
              isFinalized,
              upgraded,
              deposits, // there will be only 2 deposits when a minipool is created
              totalDeposits,
              distributions, // There will be a distribution when the minipool exits
              totalDistributions,
            };
          } catch (error) {
            console.error("An error in useMinipoolHistory occurred:", error);
            // You can return a default value or re-throw the error if you want
            // return defaultMinipoolHistory;
            // throw error;
          }
        },
      }
      )));

  return minipoolAddresses.map(
    (minipoolAddress, i) => ({
      minipoolAddress,
      ...(details[i].data || { isLoading: true }),
    }),
    []
  );
}
