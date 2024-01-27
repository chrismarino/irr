// Desc: This hook will calculate the IRR of a given set of cash flows.
import { convertRate } from 'node-irr';
import { xirr } from 'node-irr';

export default function useIRR(paymentArray) {
    const startDate = new Date(2021, 5, 1);
    let year = startDate.getFullYear();
    let month = String(startDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
    let day = String(startDate.getDate()).padStart(2, '0');
    const formattedStartDate = `${year}${month}${day}`;
    
    const today = new Date();
    year = today.getFullYear();
    month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
    day = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${year}${month}${day}`;
    const data3 = [
        { amount: -10, date: formattedStartDate },
        { amount: 11, date: formattedToday },
    ]
    const dailyRate= xirr(paymentArray).rate;
    const days = xirr(paymentArray).days;

    //Balance is uniformly earned over the period.

    //express the rate in APR
    //let rate = convertRate(dailyRate, "year")
    let rate = 100*(data3/32E18)*(365/days); //APR
    return {days, rate};
}