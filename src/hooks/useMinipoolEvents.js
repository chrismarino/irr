import useK from "./useK";
import { useWebSocketProvider } from "wagmi";
import _ from "lodash";
import { ethers } from "ethers";
import contracts from "../contracts";
import { useQueries } from "react-query";
import { useEffect, useState } from 'react';

export default async function  useMinipoolEvents(MinipoolDetails) {
  const [logs, setLogs] = useState([]);
  let provider = useWebSocketProvider();
  let minipoolAddresses = (MinipoolDetails || []).map(detail => detail.minipoolAddress)
  minipoolAddresses = _.uniq(minipoolAddresses);

  // Now we've got the minipool addresses, let find the deposit and withdrawal events for each minipool.
  let mpDelegateInterface = new ethers.utils.Interface(
    contracts.RocketMinipoolDelegate.abi
   );
  // let { data: ethWithdrawnEvents } = useK.RocketMinipoolDelegate.Find.EtherWithdrawn({
  //   args: [minipoolAddresses[0], null, null],
  //   from: 0,
  //   to: "latest",
  // });
  // console.log("Eth Withdrawn Events:", ethWithdrawnEvents);

  const mp = new ethers.Contract(
    minipoolAddresses[0],
    mpDelegateInterface,
    provider?.signer || provider
  );

  let eventFilter = mp.filters.EtherWithdrawn(minipoolAddresses[0], null, null);
  let withdrawlEventData = await provider.getLogs(eventFilter);
  
  
  const eventSignature = 'EtherWithdrawn(address,uint256,uint256)';
  const eventTopic = ethers.utils.id(eventSignature);
  
  let rawLogs = await provider.getLogs({
      address: minipoolAddresses[0],
      topics: [eventTopic],
  });
  setLogs(rawLogs);
  console.log("rawLogs:", rawLogs, "logs:", logs);

  async function fetchWithdrawalEventData() {
    const promises = minipoolAddresses.map(address => useK.RocketMinipoolDelegate.Find.EtherWithdrawn({
      args: [null, address],
      from: 0,
      to: "latest",
    }));
  
    const results = await Promise.all(promises);
  
    const withdrawalEventData = results.map(result => result.data);
    console.log("withdrawlEventData:", withdrawlEventData);

  }
  
  fetchWithdrawalEventData();
  // Note: these numbers are experimentally derived and may need tweaking as the `queryFn` changes.
  // Load this many minipools immediately without spreading out the load.
  let loadingWindowBypassCount = 50;
  // Spread out any remaining minipool loads over this-sized window of time.
  let loadingWindowMs = 25 * 1000; // 25 seconds

  let details = useQueries(
    minipoolAddresses.map((minipoolAddress, i) => ({
      queryKey: ["MinipoolEvents", minipoolAddress],
      queryFn: async () => {
        // Spread out load for large nodes.
        if (i > loadingWindowBypassCount) {
          await new Promise((resolve) =>
            setTimeout(resolve, loadingWindowMs * Math.random())
          );
        }
        const mp = new ethers.Contract(
          minipoolAddress,
          mpDelegateInterface,
          provider?.signer || provider
        );
        // Note: we don't Promise.all these reads to be gentler on the rate-limit.
        // TODO: issue a multi-read call instead.

        let eventFilter = mp.filters.EtherWithdrawn(minipoolAddress, null, null);
        let withdrawlEventData = await provider.getLogs(eventFilter);
        console.log("withdrawlEventData:", withdrawlEventData);
        let withdrawalEvents = withdrawlEventData.map((log) => {
          let parsedLog = mp.interface.parseLog(log);
          return {
            logIndex: log.logIndex,
            transactionIndex: log.transactionIndex,
            transactionHash: log.transactionHash,
            blockHash: log.blockHash,
            blockNumber: log.blockNumber,
            address: log.address,
            data: log.data,
            topics: log.topics,
            parsedLog: parsedLog,
          };
        });
        console.log("withdrawalEvents:", withdrawalEvents);
      },
    }))
  );
  return minipoolAddresses.map(
    (minipoolAddress, i) => ({
      minipoolAddress,
      ...(details[i].data || { isLoading: true }),
    }),
    []
  );
}
