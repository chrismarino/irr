import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
const APR_COLS = [
  {
    field: "nodeAddress",
    headerName: "Node Address",
    align: 'left',
    type: "number",
    flex: 2
  },
  {
    field: "walletEthDeposited",
    headerName: "Wallet Eth Deposited",
    align: 'left',
    type: "number",
    flex: 2
  },
  {
    field: "walletRPLDeposited",
    headerName: "Wallet RPL Deposited",
    align: 'left',
    type: "number",
    flex: 2
  },
  {
    field: "walletEthWithdrawn",
    headerName: "Wallet Eth Withdrawn",
    align: 'left',
    type: "number",
    flex: 2
  },
  {
    field: "walletRPLWithdrawn",
    headerName: "Wallet RPL Withdrawn",
    align: 'left',
    type: "number",
    flex: 2
  },
  {
    field: "minipool",
    headerName: "Minipool",
    align: 'left',
    type: "number",
    flex: 2
  },
  {
    field: "minipoolEthDeposited",
    headerName: "Eth Deposits to Minipools",
    type: "number",
    align: 'center',
    flex: 3

  },
  {
    field: "activated",
    headerName: "Activated",
    type: "date",
    align: 'center',
    flex: 1
  },
  {
    field: "status",
    headerName: "Status",
    type: "number",
    renderCell: (params) => (params.value ? 'Active' : 'Exited'),
    align: 'center',
    flex: 2
  },
  {
    field: "exited",
    headerName: "Exited",
    type: "date",
    align: 'center',
    flex: 1
  },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    align: 'center',
    flex: 1
  },
  {
    field: "minipoolEthWithdrawn",
    headerName: "Eth Withdrawals from Minipools",
    type: "number",
    align: 'center',
    flex: 3

  },
  // {
  //   field: 'ethPriceNow',
  //   headerName: 'Eth Price Today',
  //   flex: 1,
  //   align: 'left',
  //   type: "number",
  //   headerAlign: 'left'
  // },
  // {
  //   field: 'rpPriceNow',
  //   headerName: 'RPL Prcie Today',
  //   flex: 1,
  //   align: 'right',
  //   type: "number",
  //   headerAlign: 'right',
  //   //valueFormatter: (params) => params.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  // },
  {
    field: "eth_earned",
    headerName: "Eth Continious Rewards Earned",
    type: "number",
    align: 'right',
    flex: 3

  },
  {
    field: "eth_apr",
    headerName: "Eth Continuous Rewards APR",
    type: "number",
    align: 'center',
    flex: 2
  },
  {
    field: "fiat_gain",
    headerName: "Fiat Gain",
    type: "number",
    align: 'right',
    flex: 3

  },
  {
    field: "fiat_apr",
    headerName: "Fiat Continuous Rewards APR",
    align: 'center',
    type: "percent",
    flex: 2

  },
  {
    field: "smoothingPool",
    headerName: "Eth Periodic/Smoothing Pool Rewards to Node",
    align: 'center',
    type: "number",
    flex: 2

  },
  {
    field: "smoothingPoolShare",
    headerName: "Eth Periodic/Smoothing Pool Share to Minipool",
    align: 'center',
    type: "number",
    flex: 2

  },
  {
    field: "totalEthIRR",
    headerName: "Eth Total IRR",
    align: 'center',
    type: "number",
    flex: 2

  },
  {
    field: "totalFiatGains",
    headerName: "Eth Total Fiat Gains",
    align: 'center',
    type: "number",
    flex: 2

  },
  {
    field: "totalFiatIRR",
    headerName: "Fiat Total IRR",
    align: 'center',
    type: "number",
    flex: 2

  },
  {
    field: "RPLbalance",
    headerName: "RPL Staked",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "effectiveBalance",
    headerName: "Effective RPL Balance",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "effectiveBalanceShare",
    headerName: "Effective RPL Share",
    align: 'center',
    type: "percent",
    flex: 2
  },
  {
    field: "collateralRPL",
    headerName: "RPL Collateral",
    align: 'center',
    type: "percent",
    flex: 2
  },
  {
    field: "inflation",
    headerName: "Periodic Rewards/Smoothing Pool RPL Rewards to Node",
    align: 'center',
    type: "number",
    flex: 2

  },
  {
    field: "inflationShare",
    headerName: "Periodic Rewards/Smoothing Pool RPL Share to Minipool",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "totalRPLIRR",
    headerName: "Total RPL IRR",
    align: 'center',
    type: "number",
    flex: 2

  },
  {
    field: "totalFiatRPLGains",
    headerName: "Total Fiat RPL Gains",
    align: 'center',
    type: "number",
    flex: 2

  },
  {
    field: "totalFiatRPLIRR",
    headerName: "Total Fiat RPL IRR",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "totalMinipoolFiatIRR",
    headerName: "Total Minipool Fiat IRR",
    align: 'center',
    type: "number",
    flex: 2
  },
];


function APRGrid({ rows }) {
  if (rows === undefined) {
    return <div>Loading...</div>;
  }
  const columns = APR_COLS;
  //console.log("APRGrid rows:", rows);

  // Transform the rows to match the new column structure
  const transposedRows = APR_COLS.map((col, index) => {
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
    ...rows.filter((_, index) => transposedRows.some(row => row[`value${index}`] !== undefined)).map((_, index) => ({ field: `value${index}`, headerName: `Minipool ${index + 1}`, width: 150 })),
    //rows.filter((_, index) => transposedRows.some(row => row[`value${index}`] !== undefined)).map((_, index) => ({ field: `value${index}`, headerName: `Minipool ${index + 1}`, width: 150 })),
  ];

  return (
    <div style={{ height: 'auto', width: 800 }}>
      <DataGrid
        rows={transposedRows}
        columns={transposedColumns}
        pageSize={50}
        //getRowId={(row) => row.field} 
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

export default APRGrid;