import { useEffect, useRef, useContext } from 'react';
import useNodeFinalizedRewardSnapshots from "../hooks/useNodeFinalizedRewardSnapshots";
import useNodePendingRewardSnapshot from "../hooks/useNodePendingRewardSnapshot";
import useNodeOngoingRewardSnapshot from "../hooks/useNodeOngoingRewardSnapshot";

function useNodePeriodicRewards(nodeAddress, nodePeriodicRewards, setNodePeriodicRewards) {
  const prevNodePeriodicRewards = useRef(null);
  const finalized = useNodeFinalizedRewardSnapshots({ nodeAddress }) || [];
  const pending = useNodePendingRewardSnapshot({ nodeAddress }) || null;
  const ongoing = useNodeOngoingRewardSnapshot({ nodeAddress }) || null;
  //console.log("In Use Node Periodic Rewards:", nodeAddress, finalized, pending, ongoing)
  useEffect(() => {
    if (
      JSON.stringify(prevNodePeriodicRewards.current) === JSON.stringify(nodePeriodicRewards) &&
      (nodePeriodicRewards.length > 0) &&
      (nodePeriodicRewards.every(item => item.isLoading === false))
    ) {
      return;
    }

    const fetchData = async () => {
      // Fetch the data...
      const data = await fetchPeriodicRewards(pending, ongoing, finalized, setNodePeriodicRewards);
      if (JSON.stringify(data) !== JSON.stringify(nodePeriodicRewards)) {
        setNodePeriodicRewards(data);
        //console.log("In Use Node Periodic Rewards data:", nodeAddress, nodePeriodicRewards, data)
      }

    };
    fetchData();

    prevNodePeriodicRewards.current = nodePeriodicRewards;

  }, [nodeAddress, nodePeriodicRewards, setNodePeriodicRewards, pending, ongoing, finalized]); //will this work with only nodeAddress?

}

export default useNodePeriodicRewards;

async function fetchPeriodicRewards(pending, ongoing, finalized) {
  let rows = []
    //The now ongoing interval, precomputed
    .concat(ongoing ? [ongoing] : [])
    // The just-finished interval pending oDAO consensus
    .concat(pending ? [pending] : [])
    // The finished and finalized intervals ready for claiming
    .concat(finalized);

  return rows;
}