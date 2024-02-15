import useK from "./useK";
import { useWebSocketProvider } from "wagmi";
import _ from "lodash";
import { ethers } from "ethers";
import contracts from "../contracts";
import { useQueries } from "react-query";

export default function useMinipoolEvents(MinipoolDetails) {

  let provider = useWebSocketProvider();
  let minipoolAddresses = _.uniq(
    (MinipoolDetails || []).map(({ args: [minipoolAddress] }) => minipoolAddress)
  );

// Now we've got the minipool addresses, let find the deposit and withdrawal events for each minipool.
  let mpDelegateInterface = new ethers.utils.Interface(
    contracts.RocketMinipoolDelegate.abi
  );
  let { data: ethWithdrawnEvents } = useK.RocketMinipoolDelegate.Find.EtherWithdrawn({
    args: [minipoolAddresses, null, null],
    from: 0,
    to: "latest",
  });
  console.log("Eth Withdrawn Events:", ethWithdrawnEvents);

// Modifying the useMinipoolDetails hook to fetch the deposit and withdrawal events.

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
