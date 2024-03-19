import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
const APR_COLS = [
  {
    field: "minipoolAddress",
    headerName: "Address",
    align: 'left',
    headerAlign: 'center',
    flex: 2,
  },
  {
    field: "status",
    headerName: "Status",
    type: "number",
    renderCell: (params) => (params.value ? 'Active' : 'Exited'),
    headerAlign: 'center',
    align: 'center',
    flex: 1,
  },
  {
    field: "mpBalance",
    headerName: "MP Balance",
    align: 'center',
    headerAlign: 'center',
    type: "number",
    flex: 2,
  },
  {
    field: "nodeBalance",
    headerName: "Operators Balance",
    align: 'center',
    headerAlign: 'center',
    flex: 2,
  },
  {
    field: "protocolBalance",
    headerName: "RPLs Balance",
    type: "number",
    align: 'center',
    headerAlign: 'center',
    flex: 2,
  },
  {
    field: "totalDeposits",
    headerName: "Deposits",
    type: "number",
    align: 'center',
    headerAlign: 'center',
    flex: 1,
  },

  {
    field: "totalWithdrawals",
    headerName: "Withdrawals",
    type: "number",
    align: 'center',
    headerAlign: 'center',
    flex: 2,
  },
];
function MinipoolDetailGrid({ rows }) {
  if (rows === undefined) {
    return <div>Loading...</div>;
  }
  const columns = APR_COLS;
  //console.log("APRGrid rows:", rows);
  return (

    <DataGrid
      rows={rows}
      columns={columns}
      pageSize={10}
      getRowId={(row) => row.minipoolAddress} // Use minipool property as unique id
      pageSizeOptions={[5, 10, 20, 50, 100]}
      style={{ color: 'white' }} // Change font color to red
      rowSelection={false}
      autoHeight
      pagination
      initialState={{
        pagination: { paginationModel: { pageSize: 5 } },
      }}
    />

  );
}

export default MinipoolDetailGrid;