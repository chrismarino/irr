import getPriceData from "../getPriceData";
import { useEffect, useState } from 'react';
export default function useDepositEvents(coinID) {
    const [gotEthPriceNow, setGotEthPriceNow] = useState(false);
    const [ethPriceNow, setEthPriceNow] = useState([]);
    const [gotRplPriceNow, setGotRplPriceNow] = useState(false);
    const [rplPriceNow, setRplPriceNow] = useState([]);
    const [gotPriceNow, setGotPriceNow] = useState(false);
    const [priceNow, setPriceNow] = useState([]);
    useEffect(() => {
        async function fetchDepositEvents(coinID) {
            if (coinID === "") {
                coinID = "ethereum";
                console.log("coinID is empty. Setting to ethereum");
            }
            let today = new Date();
            let formattedDate = today.toISOString().split('T')[0];
            //date must be in the format of YYYY-MM-DD for getPriceData
            let dateArray = [formattedDate];
            const priceNow = await getPriceData(dateArray, coinID); //fetch the price of eth. No date returns the current price.
            if (coinID === "ethereum") {
                setEthPriceNow(priceNow);
                setGotEthPriceNow(true);
                setPriceNow(priceNow);
                setGotPriceNow(true);
            }
            else if (coinID === "rocket-pool") {
                setRplPriceNow(priceNow);
                setGotRplPriceNow(true);
                setPriceNow(priceNow);
                setGotPriceNow(true);
            }
        }
        fetchDepositEvents(coinID);
    }, []); // Only run if the coinID changes, otherwise 
    return { priceNow, gotPriceNow };

}
