useEffect(() => {
    async function fetchData1() {
       if (!withdrawalsHasRun.current) {
         minipoolAddressArray.forEach((address) => {
           fetchWithdrawls(address).then(oneWithdrawl => {
             allWithdrawls = allWithdrawls.concat(oneWithdrawl.result);
             setWithdrawls(allWithdrawls);
             setWithdrawlCount(withdrawlCount => withdrawlCount + 1);
             console.log("All Withdrawals:", allDeposits, "Withdrawl Count:", withdrawlCount);
           });
         });
         withdrawalsHasRun.current = true;
       }}
      fetchData1();
    }, []);