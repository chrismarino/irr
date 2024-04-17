import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';
const TOPOFF_COLS = [
  {
    field: "date",
    headerName: "Date",
    description: "Date of RPL deposit",
    headerAlign: 'center',
    align: 'left',
    type: "date",
    flex: 1
  },
  {
    field: "minipools",
    headerName: "Active Minipools",
    description: "Number of Active Minipools on this date",
    type: "number",
    align: 'center',
    headerAlign: 'center',
    flex: 1

  },
  {
    field: "effectiveBalance",
    headerName: "Effective Balance",
    description: "Effective Balance of RPL",
    type: "date",
    align: 'center',
    headerAlign: 'center',
    flex: 1
  },
  {
    field: "deposit",
    headerName: "RPL Deposit",
    description: "RPL deposit on this date",
    type: "date",
    align: 'center',
    headerAlign: 'center',
    flex: 1
  },
  {
    field: "rplPrice",
    headerName: "RPL Price",
    description: "RPL price on this date",
    type: "date",
    align: 'center',
    headerAlign: 'center',
    flex: 1
  },
  {
    field: "roi",
    headerName: "ROI",
    description: "Return on this Topoff. Includs Rewards and RPL price change",
    type: "number",
    renderCell: (params) => (params.value ? 'Active' : 'Exited'),
    align: 'center',
    headerAlign: 'center',
    flex: 1
  },
  {
    field: "ethPrice",
    headerName: "Eth Price",
    description: "Eth price on this date",
    type: "date",
    align: 'center',
    headerAlign: 'center',
    flex: 1
  },
  {
    field: "vEth",
    headerName: "vs Eth",
    description: "ROI of topoff in Eth",
    type: "number",
    renderCell: (params) => (params.value ? 'Active' : 'Exited'),
    align: 'center',
    headerAlign: 'center',
    flex: 1
  },

];


function TopoffTable({ tableRows }) {
  const columns = TOPOFF_COLS;
  //console.log("APRGrid tableRows:", tableRows);


  return (
    <div style={{ height: 'auto', width: 1000 }}>
      <DataGrid
        rows={tableRows}
        columns={columns}
        pageSize={10}
        //getRowId={(row) => row.field} 
        pageSizeOptions={[5, 10, 20, 50, 100]}
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

export default TopoffTable;