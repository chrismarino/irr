import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

function WalletTable({ gridRows }) {

    const WALLET_ROWS = [
        {
            field: "nodeAddress",
            headerName: "Node Address",
            align: 'left',
            type: "number",
            flex: 3
        },
        {
            field: "walletEthDeposited",
            headerName: "Total Deposited",
            align: 'left',
            type: "number",
            flex: 2
        },
        {
            field: "walletEthWithdrawn",
            headerName: "Total Withdrawn",
            align: 'left',
            type: "number",
            flex: 2
        },
        {
            field: "walletEthtoMinipools",
            headerName: "Withdrawn to Minipoools/Staked",
            align: 'left',
            type: "number",
            flex: 2
        },
        {
            field: "walletEthBalance",
            headerName: "Wallet Balance",
            align: 'left',
            type: "number",
            flex: 2
        },
        {
            field: "walletEthFiatDeposited",
            headerName: "Value Deposited",
            align: 'left',
            type: "number",
            flex: 2
        },
        {
            field: "walletEthFiatWithdrawn",
            headerName: "Value Withdrawn",
            align: 'left',
            type: "number",
            flex: 2
        },
        {
            field: "walletEthCurrentFiatValue",
            headerName: "Current Value",
            align: 'left',
            type: "number",
            flex: 2
        },

    ];
    const FIELDS = ["Total Deposited",
        "Total Withdrawn",
        "Withdrawn to Minipoools/Staked",
        "Wallet Balance",
        "Value Deposited",
        "Value Withdrawn",
        "Current Value"];
    if (gridRows === undefined) return null;
    let Eth = Object.keys(gridRows[0]).filter(key => key.includes('Eth'));
    let RPL = Object.keys(gridRows[0]).filter(key => key.includes('RPL'));

    Eth = Eth.map(field => gridRows[0][field]);
    RPL = RPL.map(field => gridRows[0][field]);

    let rows = [{ fields: FIELDS, EthValues: Eth, RPLValues: RPL }];
    let explodedRows = FIELDS.map((field, index) => ({
        field: field,
        EthValue: Eth[index],
        RPLValue: RPL[index]
      }));
    return (
        <TableContainer>
            <Table>

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