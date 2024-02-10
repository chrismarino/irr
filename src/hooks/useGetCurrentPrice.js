import getPriceData from "../getPriceData";
import { useEffect, useState } from 'react';
export default function useGetCurrentPrice() {
    //const [gotEthPriceToday, setGotEthPriceToday] = useState(false);
    const [ethPriceNow, setEthPriceNow] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
    async function fetchEthPriceToday() {
        let today = new Date();
        let formattedDate = today.toISOString().split('T')[0];
        //date must be in the format of YYYY-MM-DD for getPriceData
        let dateArray = [formattedDate];
        const ethPriceNow = await getPriceData(dateArray); //fetch the price of eth. No date returns the current price.
        setEthPriceNow(ethPriceNow);
        setLoading(false);
        //setGotEthPriceToday(true);
    }
    fetchEthPriceToday();
}, []);

    return { ethPriceNow, loading };
}
