// New fetchDeposit function that uses the validator stats API endpoint
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { mainnet } from "wagmi/chains";

export default async function getValidatorStats(validatorIndex) {
  const { chains, provider, webSocketProvider } = configureChains(
    [mainnet],
    [
      alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_KEY }),
      publicProvider(),
    ]
  );
  const wagmiClient = createClient({
    autoConnect: true,
    provider,
    webSocketProvider
    // connectors: [
    //   new SafeConnector({
    //     chains,
    //     options: {
    //       allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
    //       debug: false,
    //     },
    //   }),
    //   new InjectedConnector({
    //     chains,
    //   }),
    //   new WalletConnectConnector({
    //     chains,
    //     options: {
    //       projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
    //     },
    //   }),
    // ],
  });
  let provider = useWebSocketProvider();
  // A utility function used to fetch the deposits and withdrawl history from an API. Take a url as an argument.
  let status = true;
  let depositDaysArray = [];
  try {
    let payouts = [];
    //payouts = await axios(statsUrl); //change this to wagmiClient, I think.
    var nodeDepositsAndWithdrawals = payouts.data.data.map(item => ({
      day: item.day, // The day in the life of the chain
      date: item.day_start, // day of the deposit or withdrawl. Don't reformat this date needed as Date later
      deposits: item.deposits,
      withdrawals: item.withdrawals,
      deposits_amount: item.deposits_amount,
      withdrawals_amount: item.withdrawals_amount,
      validatorIndex: validatorIndex,
      status: true
    })).filter(item => item.deposits_amount > 0 || item.withdrawals_amount > 0);
    // Set the minipool status to false if the minipool has exited. Do this before another async call.
    nodeDepositsAndWithdrawals = nodeDepositsAndWithdrawals.map(item => {
      if (item.withdrawals_amount === 32000000000) {
        status = false; // set the status for this minipool to false
        return { ...item, status: false }; //set it in the data array as well.
      } else {
        return item;
      }
    });
    // Create an array of deposit dates so we can look up the eth price at the time of the deposit
    let depositDays = await Promise.all(nodeDepositsAndWithdrawals.filter(item => item.deposits_amount > 0));
    depositDaysArray.push(depositDays.date);
    //console.log("Node Deposits and Withdrawals dates:", depositDaysArray);
    return { nodeDepositsAndWithdrawals, depositDaysArray, status };
  } catch (error) {
    console.log("Alchemy Error on Deposit Fetch:", error);
  }
};