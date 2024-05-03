// Desc: This hook will calculate the IRR of a given set of cash flows.
import axios from 'axios';

export default async function getRocketpoolValidatorStats(validatorArray) {
  // Fetch the minipool stats from Beaconcha.in from an arry of validator indexes. Return an array of objects with the
  // Rocketpool values. This should be updated whenever the Node address feild is changed on the page. 
  validatorArray = validatorArray.filter(validator => {
    if (validator.validatorIndex === null) {
      console.warn("Warning: Null validator found.");
      return false;
    }
    return true;
  });
  let appUrl = process.env.REACT_APP_BEACONCHAIN_URL
  let apiEndpoint = appUrl + "/api/v1"
  let apikey = process.env.REACT_APP_BEACONCHAIN_KEY
  let node_action = "/rocketpool/validator/";
  // URL https://beaconcha.in/api/v1/rocketpool/validator/983397%2C1101573%2C810338
  let validatorIndexString = validatorArray.map(validator => validator.validatorIndex).join(',');
  let nodeUrl = (apiEndpoint + node_action + validatorIndexString + "?apikey=" + apikey)
  try {
    let rocketpoolValidators = [];

    rocketpoolValidators = await axios(nodeUrl);
    // map the deposits to the same format as the withdrawls (beasoncha.in API returns a different format)
    const validators = rocketpoolValidators.data.data;
    // Check if validators is an array
    if (!Array.isArray(validators)) {
      // If not, wrap it in an array
      return [validators];
    }
    return validators;
  } catch (error) {
    console.log("Axios Error on Rocketpool Validator Stats Fetch:", error);
  }
};








