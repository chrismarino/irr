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
    field: "walletEthFiatDeposited",
    headerName: "Value of Eth Deposited",
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
    field: "walletRPLFiatDeposited",
    headerName: "Value of RPL Deposited",
    align: 'left',
    type: "number",
    flex: 2
  },
  {
    field: "walletEthWithdrawn",
    headerName: "Eth Withdrawn",
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
    field: "walletRPLWithdrawn",
    headerName: "RPL Withdrawn",
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
];


function WalletGrid({ rows }) {
  if (rows === undefined) {
    return <div>Loading...</div>;
  }
  const columns = WALLET_COLS;
  rows = rows.map((row, index) => ({
    ...row,
    rowId: index
  
  }));
  let topRow = [rows[0]];
  //console.log("WalletGrid rows Object:", rows, topRow);
  return (
    <div style={{ height: 'auto', width: 800 }}>
      <DataGrid
        rows={topRow}
        columns={columns}
        pageSize={9}
        getRowId={(row) => row.rowId}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        style={{ color: 'white' }} // Change font color to red
        rowSelection={false}
        autoHeight
      pagination
      //initialState={{
      //  pagination: { paginationModel: { pageSize: rows.length } },
      //}}
      />
    </div>
  );
}

export default WalletGrid;