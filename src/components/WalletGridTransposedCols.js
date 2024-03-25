import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
const WALLET_COLS = [
    {
      field: "nodeAddress",
      headerName: "Node Address",
      align: 'left',
      type: "number",
      flex: 3
    },
    {
      field: "walletEthDeposited",
      headerName: "Eth Deposited",
      align: 'left',
      type: "number",
      flex: 2
    },
    {
      field: "walletEthWithdrawn",
      headerName: "Total Eth Withdrawn",
      align: 'left',
      type: "number",
      flex: 2
    },
    {
      field: "walletEthtoMinipools",
      headerName: "Eth to Minipoools",
      align: 'left',
      type: "number",
      flex: 2
    },
    {
      field: "walletEthBalance",
      headerName: "Wallet Eth Balance",
      align: 'left',
      type: "number",
      flex: 2
    },
    {
      field: "walletEthFiatDeposited",
      headerName: "Value of Eth Deposited",
      align: 'left',
      type: "number",
      flex: 2
    },
    {
      field: "walletEthFiatWithdrawn",
      headerName: "Value of Eth Withdrawn",
      align: 'left',
      type: "number",
      flex: 2
    },
    {
      field: "walletEthCurrentFiatValue",
      headerName: "Current Value of all Eth",
      align: 'left',
      type: "number",
      flex: 2
    },
    {
      field: "walletRPLDeposited",
      headerName: "RPL Deposited",
      align: 'left',
      type: "number",
      flex: 2
    },
    {
      field: "walletRPLWithdrawn",
      headerName: "RPL Withdrawn",
      align: 'left',
      type: "number",
      flex: 2
    },
    {
      field: "walletRPLStaked",
      headerName: "RPL Staked",
      align: 'left',
      type: "number",
      flex: 2
    },
    {
      field: "walletRPLBalance",
      headerName: "RPL Balance",
      align: 'left',
      type: "number",
      flex: 2
    },

    {
      field: "walletRPLFiatDeposited",
      headerName: "Value of RPL Deposited",
      align: 'left',
      type: "number",
      flex: 2
    },
    {
      field: "walletRPLFiatWithdrawn",
      headerName: "Value of RPL Withdrawn",
      align: 'left',
      type: "number",
      flex: 2
    },
    {
      field: "walletRPLCurrentFiatValue",
      headerName: "Current Value of all RPL",
      align: 'left',
      type: "number",
      flex: 2
    },
  ];

function WalletGridTransposedCols({ rows }) {
    if (rows === undefined) {
        return <div>Loading...</div>;
    }
    const columns = WALLET_COLS;
    let topRow = [rows[0]];
    // Transform the rows to match the new column structure
    const transposedRows = WALLET_COLS.map((col, index) => {
        const newRow = { id: index, headerName: col.headerName };
        rows.forEach((row, rowIndex) => {
            newRow[`value${rowIndex}`] = row[col.field];
        });
        return newRow;
    });
    // Create new column definitions
    const transposedColumns = [
        { field: 'headerName', headerName: 'Performance Metric', width: 150 },
        //  ...rows.map((_, index) => ({ field: `value${index}`, headerName: `Minipool ${index + 1}`, width: 150 })),
        ...topRow.filter((_, index) => transposedRows.some(row => row[`value${index}`] !== undefined)).map((_, index) => ({ field: `value${index}`, headerName: `Value ${index + 1}`, width: 150 })),
        //rows.filter((_, index) => transposedRows.some(row => row[`value${index}`] !== undefined)).map((_, index) => ({ field: `value${index}`, headerName: `Minipool ${index + 1}`, width: 150 })),
    ];


    //console.log("WalletGrid rows Object:", rows, topRow);
    return (
        <div style={{ height: 'auto', width: 800 }}>
            <DataGrid
                rows={transposedRows}
                columns={transposedColumns}
                //pageSize={50}
                //getRowId={(row) => row.field}
                //pageSizeOptions={[5, 10, 20, 50, 100]}
                style={{ color: 'white' }} // Change font color to red
                rowSelection={false}
                autoHeight
            //pagination
            //initialState={{
            //  pagination: { paginationModel: { pageSize: rows.length } },
            //}}
            />
        </div>
    );
}

export default WalletGridTransposedCols;