import { useEffect, useState, useContext } from 'react';
import useNodeFinalizedRewardSnapshots from "../hooks/useNodeFinalizedRewardSnapshots";
import useNodePendingRewardSnapshot from "../hooks/useNodePendingRewardSnapshot";
import useNodeOngoingRewardSnapshot from "../hooks/useNodeOngoingRewardSnapshot";

function useNodePeriodicRewards(nodeAddress, nodePeriodicRewards, setNodePeriodicRewards) {
  const finalized = useNodeFinalizedRewardSnapshots({ nodeAddress }) || [];
  const pending = useNodePendingRewardSnapshot({ nodeAddress }) || null;
  const ongoing = useNodeOngoingRewardSnapshot({ nodeAddress }) || null;
  //console.log("In Use Node Periodic Rewards:", nodeAddress, finalized, pending, ongoing)
  useEffect(() => {
    const fetchData = async () => {
      // Fetch the data...
      const data = await fetchPeriodicRewards(pending, ongoing, finalized, setNodePeriodicRewards);
      if (JSON.stringify(data) !== JSON.stringify(nodePeriodicRewards)) {
        setNodePeriodicRewards(data);
      }
      //console.log("In Use Node Periodic Rewards data:", data)
    };
    fetchData();

    }, [nodeAddress, pending, ongoing, finalized]); //will this work with only nodeAddress?

 }

export default useNodePeriodicRewards;

async function  fetchPeriodicRewards(pending, ongoing, finalized) {
  let rows = []
    //The now ongoing interval, precomputed
    .concat(ongoing ? [ongoing] : [])
    // The just-finished interval pending oDAO consensus
    .concat(pending ? [pending] : [])
    // The finished and finalized intervals ready for claiming
    .concat(finalized);
    //console.log("In Use Node Periodic Rewards rows:", rows)
  return rows;
}