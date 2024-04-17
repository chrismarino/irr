import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

function WalletTable({ tableRows }) {

    // This is a hacky way to get the fields in the right order. Must match the array order
    const FIELDS = ["Current Price",
        "Total Deposited",
        "Total Withdrawn",
        "Minipool Bonds/Staked",
        "Total Fees",
        "Wallet Balance",
        "Return of Capital",
        "Distributed Continuous Rewards",
        "Undistributed Continuous Rewards",
        "Total Continuous Rewards",
        "Total Continuous Rewards IRR",
        "Claimed Periodic Rewards",
        "Unclaimed Periodic Rewards",
        "Total Periodic Rewards",
        "Total Periodic Rewards IRR",
        "Total Rewards Earned",
        "Node Total Balance",
        "Node Total Gain",
        "Node IRR",
    ];
// These tool tips are use. Need to put them in the cells. To do.
        const TOOLTIPS = ["The current price of Eth",
        "The total amount of Eth deposited",
        "The total amount of Eth withdrawn, includes minipool bonds and staked RPL",
        "Total Eth and RPL withdrawn from wallet for Minipool bonds or Staked RPL. Considered as wallet withdrawals for IRR calculations..",
        "The total fees paid by this node",
        "The current balance in node wallet",
        "The return of bond and staked capital",
        "The distributed continuous rewards",
        "The undistributed continuous rewards",
        "Total distributed and undistributed continuous rewards",
        "IRR of total continuous rewards",
        "Claimed periodic rewards",
        "Unlaimed periodic rewards",
        "Total periodic rewards",
        "IRR of total periodic rewards",
        "Total reward payouts (i.e. claimed and distributed rewards)",
        "The total balance of the node. Includes bonds, unclaimed and undistributed rewards, and wallet balance.",
        "The total gain of the node. Includes bonds, all rewards and distributions, and wallet flows. For native currencies this will be just the total rewards payout. For fiat, it captures change in currency $USD price",
        "The IRR of the node. Includes bonds, all rewards and distributions, and wallet flows.",
    ];

    if (!tableRows || tableRows.length === 0) return null;
    let Eth = Object.keys(tableRows[0]).filter(key => key.includes('Eth'));
    let RPL = Object.keys(tableRows[0]).filter(key => key.includes('RPL'));

    Eth = Eth.map(field => tableRows[0][field]);
    RPL = RPL.map(field => tableRows[0][field]);

    let rows = [{ fields: FIELDS, EthValues: Eth, RPLValues: RPL }];
    let explodedRows = FIELDS.map((field, index) => ({
        field: field,
        EthValue: Eth[index],
        RPLValue: RPL[index]
    }));
    if (tableRows.length === 0) {
        return <div>Loading...</div>;
    }
    return (
        <TableContainer>
            <Table>
            {/* <h1 style={{ textAlign: 'center' }}>Wallet Details</h1> */}
                <TableHead>
                    <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell>Eth</TableCell>
                        <TableCell>RPL</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {explodedRows.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell>{row.field}</TableCell>
                            <TableCell>{row.EthValue}</TableCell>
                            <TableCell>{row.RPLValue}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default WalletTable;