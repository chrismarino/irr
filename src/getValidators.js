import axios  from 'axios';
export default async function getValidators(ethAddress) {
    // Fetch validator list from Beaconcha.in using eth1 address. 
    // Response includes a record for each validator. 
    // This should be updated whenever the Node address feild is changed on the page. Save this array as `nodeValidators`
    let appUrl = process.env.REACT_APP_BEACONCHAIN_URL
    let apiEndpoint = appUrl + "/api/v1"
    let apikey = process.env.REACT_APP_BEACONCHAIN_KEY
    let node_action = "/validator/eth1/";
  
    let nodeUrl = (apiEndpoint + node_action + ethAddress + "?apikey=" + apikey)
    function isValidEthAddress(ethAddress) {
      const regex = /^0x[a-fA-F0-9]{40}$/;
      return regex.test(ethAddress);
    }
    if (!isValidEthAddress(ethAddress)) {
      return [];
    }
    try {
      let nodeValidators = [];
  
      nodeValidators = await axios(nodeUrl);
      // map the deposits to the same format as the withdrawls (beasoncha.in API returns a different format)
      const validators = nodeValidators.data.data;
      return validators;
    } catch (error) {
      console.log("Axios Error on Node Detail Fetch:", error);
    }
  };