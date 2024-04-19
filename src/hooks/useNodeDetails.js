import { useWebSocketProvider } from "wagmi";
import React from "react";
import { ethers } from "ethers";
import contracts from "../contracts";
import { useEffect, useState , useContext} from 'react';
import DataContext from '../components/DataContext';


// A React hook that finds the Creation Event for each minipool on a Node and also fetches the 
// details of a node. Returns an array of minipool addresses and the node details
// struct NodeDetails {
//     bool* exists;
//     uint256* registrationTime;
//     string* timezoneLocation;
//     bool* feeDistributorInitialised;
//     address* feeDistributorAddress;
//     uint256* rewardNetwork;
//     uint256* rplStake;
//     uint256* effectiveRPLStake;
//     uint256* minimumRPLStake;
//     uint256* maximumRPLStake;
//     uint256* ethMatched;
//     uint256* ethMatchedLimit;
//     uint256* minipoolCount;
//     uint256* balanceETH;
//     uint256* balanceRETH;
//     uint256* balanceRPL;
//     uint256* balanceOldRPL;
//     uint256* depositCreditBalance;
//     uint256* distributorBalanceUserETH;
//     uint256* distributorBalanceNodeETH;
//     address* withdrawalAddress;
//     address* pendingWithdrawalAddress;
//     bool* smoothingPoolRegistrationState;
//     uint256* smoothingPoolRegistrationChanged;
//     address* nodeAddress;
// }


export default function useNodeDetails(nodeAddress) {

  const { show, setShow, setNodeNativeIRR } = useContext(DataContext);
  const [nodeDetails, setNodeDetails] = useState(null);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  let provider = useWebSocketProvider();
  // Set the interface for NodeDetails contract
  const node = React.useMemo(() => {
    let nodeInterface = new ethers.utils.Interface(
      contracts.RocketNodeManager.abi
    );
    //('Creating new Node Interface:', nodeInterface);
    // Create a new contract instance for the node. Uses the Nodemanager Contract Address, not the node address.
    return new ethers.Contract(
      contracts.RocketNodeManager.address,
      nodeInterface,
      provider?.signer || provider
    );
  }, [provider]);

  useEffect(() => {
    const fetchNodeDetails = async () => {
      const maxRetries = 5;
      const delay = 250; // Delay in milliseconds
      let details
      for (let i = 0; i < maxRetries; i++) {
        try {
          const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(nodeAddress);
          if (!isValidAddress) {
            console.log("Invalid address in useNodeDetails");
            break
          } 
          //console.log("Trying to get Node Details:", nodeAddress, "Retry:", i);
          details = await node.getNodeDetails(nodeAddress);
          setNodeDetails(details);
          //handleShow(); //for testing
          break; //got the details, break out of the loop
        } catch (error) {
          if (error.response && error.response.status === 429) {
            console.log('Rate limit exceeded fetching node details, retrying...');
            await new Promise(resolve => setTimeout(resolve, delay));
            handleShow();
          } else {
            if (error.code === 'CALL_EXCEPTION') {
              console.log('Call exception in getNodeDetails, most likely getting throttled for CPU consumption. Retrying...');
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              console.log('Error fetching node details:', error);
              throw error; // If the error code is not CALL_EXCEPTION, re-throw it
            }
          }
        }

      }
    };

    fetchNodeDetails();
  }, [nodeAddress]);
  if (!nodeDetails) {
    return { isLoading: true };
  } else {
    return {
      nodeAddress: nodeAddress,
      balanceRPL: parseFloat(ethers.utils.formatEther(nodeDetails.balanceRPL || 0)).toFixed(4),
      balanceETH: parseFloat(ethers.utils.formatEther(nodeDetails.balanceETH || 0)).toFixed(4),
      effectiveRPLStake: parseFloat(ethers.utils.formatEther(nodeDetails.effectiveRPLStake || 0)).toFixed(4),
      rplStake: parseFloat(ethers.utils.formatEther(nodeDetails.rplStake || 0)).toFixed(4),
      ethMatched: parseFloat(ethers.utils.formatEther(nodeDetails.ethMatched || 0)).toFixed(4),
    }
  };
}