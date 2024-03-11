import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
const APR_COLS = [
  {
    field: "minipoolAddress",
    headerName: "Address",
    align: 'left',
    flex: 1
  },
  {
    field: "status",
    headerName: "Status",
    type: "number",
    renderCell: (params) => (params.value ? 'Active' : 'Exited'),
    align: 'center',
    flex: 1
  }, 
  {
    field: "displayBalance",
    headerName: "Balance",
    align: 'center',
    type: "number",
    flex: 3

  },
  {
    field: "displayNodeBalance",
    headerName: "Operators Balance",
    align: 'center',
    flex: 3
  },
  {
    field: "displayProtocolBalance",
    headerName: "Protocols Balance",
    type: "number",
    align: 'right',
    flex: 3

  },
  {
    field: "displayTotalDeposits",
    headerName: "Deposits",
    type: "number",
    align: 'center',
    flex: 1
  },

  {
    field: "displayTotalWithdrawals",
    headerName: "Withdrawals",
    type: "number",
    align: 'center',
    flex: 1

  },
  {
    field: "displayCalculatedNodeShare",
    headerName: "displayCalculatedNodeShare",
    type: "number",
    align: 'right',
    flex: 1

  },



];
function MinipoolDetailGrid({ rows }) {
  if (rows === undefined) {
    return <div>Loading...</div>;
  }
  const columns = APR_COLS;
  //console.log("APRGrid rows:", rows);
  return (
    <div style={{ height: 400, width: 800 }}>
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
    </div>
  );
}

export default MinipoolDetailGrid;