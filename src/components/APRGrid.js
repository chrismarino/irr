
import React, { useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';
import DataContext from '../components/DataContext';
const APR_COLS = [
  {
    field: "minipool",
    headerName: "Minipool",
    description: "Minipool Index",
    align: 'left',
    type: "number",
    flex: 2
  },
  {
    field: "activated",
    headerName: "Activated",
    description: "Date Minipool began attesting",
    type: "date",
    align: 'center',
    flex: 1
  },
  {
    field: "status",
    headerName: "Status",
    description: "Minipool Status. Active or Exited",
    type: "number",
    renderCell: (params) => (params.value ? 'Active' : 'Exited'),
    align: 'center',
    flex: 2
  },
  {
    field: "exited",
    headerName: "Exited",
    description: "Date a Minipool Exited. The end date for price and IRR calculations for exited Minipools.",
    type: "date",
    align: 'center',
    flex: 1
  },
  {
    field: "age",
    headerName: "Age",
    description: "Age of Minipool in days. Exited Minipools stop aging on exit date.",
    type: "number",
    align: 'center',
    flex: 1
  },
  {
    field: "ethDeposited",
    headerName: "Eth Deposits",
    description: "Eth bond deposited to Minipool (i.e. LEB8 or LEB16)",
    type: "number",
    align: 'center',
    flex: 3

  },
  {
    field: "ethReturned",
    headerName: "Eth Returned",
    description: "Eth bond returned by exiting Minipool.",
    type: "number",
    align: 'center',
    flex: 3

  },
  {
    field: "continuousRewardsDistributed",
    headerName: "Distributed Continuous Rewards",
    description: "Continuous Rewards distributed from Minipool. All rewards for exited Minipools are automatically distributed.",
    type: "number",
    align: 'right',
    flex: 3
  },
  {
    field: "continuousRewardsUndistributed",
    headerName: "Undistributed Continuous Rewards",
    description: "Continuous Rewards earned but not yet distributed. Includes an estimate of for current ongoing rewards interval.",
    type: "number",
    align: 'right',
    flex: 3
  },
  {
    field: "continuousRewardsTotal",
    headerName: "Total Continuous Rewards",
    description: "Total claimed and unclaimed rewards to Minipool over its life.",
    type: "number",
    align: 'center',
    flex: 2
  },
  {
    field: "continiousRewardsIRR",
    headerName: "Continuous Rewards IRR",
    description: "IRR of Continuous Rewards Eth. Fiat IRR is not calculated for Continuous Rewards.",
    type: "number",
    align: 'center',
    flex: 2
  },
  {
    field: "smoothingPoolClaimed",
    headerName: "Claimed Smoothing Pool Rewards",
    description: "Allocated share of node's claimed Smoothing Pool rewards to Minipool. Based on the daily weighed average of Minipool bond and total bond across all active Minipools during a rewards interval.",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "smoothingPoolUnclaimed",
    headerName: "Unclaimed Smoothing Pool Rewards",
    description: "Allocated share of node's unclained Smoothing Pool rewards to Minipool. Based on the daily weighed average of Minipool bond and total bond across all active Minipools during the interval.",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "smoothingPoolTotal",
    headerName: "Total Smoothing Pool Rewards",
    description: "Total claimed and unclaimed Smooting Pool rewards to Minipool over its life.",
    type: "number",
    align: 'center',
    flex: 2
  },
  {
    field: "smoothingPoolIRR",
    headerName: "Smoothing Pool IRR",
    description: "IRR of Smooting Pool Rewards Eth allocated to Minipool. IRR based on flows of all Smoothing Pool Rewards Eth earned by this Minipool over life of Minipool. Fiat IRR is not calculated for Smoothing Pool Rewards.",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "totalEthtoMinipool",
    headerName: "Total Eth Rewards",
    description: "Total Eth earned by this Minipool. Includes all Continuous and Smoothing Pool Eth rewards.",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "inflationClaimed",
    headerName: "Claimed RPL Inflation",
    description: "Allocated share of claimed RPL Inflation rewards to Minipool. Based on daily weighed average of Minipool bond and total bond across all active Minipools during the interval.",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "inflationUnclaimed",
    headerName: "Unclaimed RPL Inflation",
    description: "Allocated share of unclained RPL Inflation rewards to Minipool. Based on daily weighed average of Minipool bond and total bond across all active Minipools during the interval.",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "inflationTotal",
    headerName: "Total RPL Inflation",
    description: "Total RPL Inflation rewards to Minipool over its life. Sum of claimed and unclaimed RPL Inflation rewards.",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "inflationIRR",
    headerName: "RPL Inflation IRR",
    description: "IRR of RPL Inflation rewards. Uses current price of RPL for Active Minipools, price on date of exit for Exited Minipools.,",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "totalEthGain",
    headerName: "Total Minipool Gain",
    description: "Total gain of this Minipool. For native tokens this is the same as Total Eth Rewards. For fiat currency it also includes change in token price.",
    align: 'center',
    type: "number",
    flex: 2
  },
  {
    field: "totalEthIRR",
    headerName: "Eth Total IRR",
    desciption: "IRR of all Eth earned by this Minipool",
    align: 'center',
    type: "number",
    flex: 2

  },
];


function APRGrid({ tableRows }) {
  const { displayDetail } = useContext(DataContext);
  const columns = APR_COLS;
  //console.log("APRGrid tableRows:", tableRows);

  // Transform the rows to match the new column structure
  let transposedRows = APR_COLS.map((col, index) => {
    const newRow = {
      id: index,
      headerName: col.headerName,
      description: col.description
    };
    tableRows.forEach((row, rowIndex) => {
      newRow[`value${rowIndex}`] = row[col.field];
      newRow[`description${rowIndex}`] = row.description; // Add this line to add tooltip to each cell
    });
    return newRow;
  });
  // Create new column definitions
  const transposedColumns = [
    {
      field: 'headerName',
      headerName: 'Performance Metric',
      width: 325,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Tooltip title={params.row.description}>
          <span>{params.value}</span>
        </Tooltip>
      ),
    },
    ...tableRows.filter((_, index) => transposedRows.some(row => row[`value${index}`] !== undefined)).map((_, index) => ({
      field: `value${index}`,
      headerName: `Minipool ${index + 1}`,
      width: 125,
      headerAlign: 'center',
      align: 'right',
      renderCell: (params) => (
        <Tooltip title={params.row.description}>
          <span>{params.value}</span>
        </Tooltip>
      ),
    })),
  ];
  const detailRows = [
    "Activated", 
    "Exited",
    "Age", 
    "Eth Returned",
    "Claimed RPL Inflation", 
    "Unclaimed RPL Inflation",
    "Unclaimed Smoothing Pool Rewards",
    "Claimed Smoothing Pool Rewards",
    "Distributed Continuous Rewards",
    "Undistributed Continuous Rewards",
  ];
  // Display only the detail rows if displayDetail is false
  if (!displayDetail) {
    transposedRows = transposedRows.filter(row => !detailRows.includes(row.headerName));
  }
  return (
    <div style={{ height: 'auto', width: 1000 }}>
      <DataGrid
        rows={transposedRows}
        columns={transposedColumns}
        pageSize={50}
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

export default APRGrid;