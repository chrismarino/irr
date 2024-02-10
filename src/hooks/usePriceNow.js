import getPriceData from "../getPriceData";
import { useEffect, useState } from 'react';
export default function usePriceNow() {
    const [gotEthPriceNow, setGotEthPriceNow] = useState(false);
    const [ethPriceNow, setEthPriceNow] = useState([]);
    useEffect(() => {
    async function fetchEthPriceToday() {
        let today = new Date();
        let formattedDate = today.toISOString().split('T')[0];
        //date must be in the format of YYYY-MM-DD for getPriceData
        let dateArray = [formattedDate];
        const ethPriceNow = await getPriceData(dateArray); //fetch the price of eth. No date returns the current price.
        setEthPriceNow(ethPriceNow);
        setGotEthPriceNow(true);
    }
    fetchEthPriceToday();
}, []);

    return { ethPriceNow, gotEthPriceNow };
}
