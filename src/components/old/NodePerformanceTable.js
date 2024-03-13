import { DataGrid } from "@mui/x-data-grid";
import { Button, Stack, Tooltip, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import moment from "moment";

import CurrencyValue from "../CurrencyValue";
import useNodeFinalizedRewardSnapshots from "../../hooks/useNodeFinalizedRewardSnapshots";
import useNodePendingRewardSnapshot from "../../hooks/useNodePendingRewardSnapshot";
import useNodeOngoingRewardSnapshot from "../../hooks/useNodeOngoingRewardSnapshot";

//import DataToolbar from "./DataToolbar";
import _ from "lodash";


// Create a client


const INTERVAL_COLS = [
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
    field: "activated",
    headerName: "Activated",
    align: 'left',
    flex: 1
  },
  {
    field: "exited",
    headerName: "Exited",
    align: 'left',
    flex: 1
  },
  {
    field: "age",
    headerName: "Age",
    align: 'left',
    flex: 1
  },
  {
    field: "totalEthDeposits",
    headerName: "Total Eth Deposits",
    align: 'left',
    flex: 1
  },
  {
    field: "smoothingPoolEth",
    type: "number",
    headerName: "Smoothing Pool Eth To Node",
    width: 150,

    valueGetter: ({ value }) => ethers.BigNumber.from(value || 0),
    valueFormatter: (params) => ethers.utils.formatEther(params.value || 0),
    renderCell: ({ value, row: { type } }) => (
      <Tooltip
        sx={{ cursor: "help" }}
        title={
          type === "ongoing"
            ? "This is the node’s share of the current smoothing pool balance. It will continue to grow until the end of the interval."
            : "This is the node’s share of the smoothing pool for the interval."
        }
      >
        <Stack direction="row" spacing={1} alignItems="baseline">
          {type === "ongoing" && (
            <Typography
              component="span"
              variant="inherit"
              color="text.secondary"
            >
              &ge;
            </Typography>
          )}
          <CurrencyValue
            size="small"
            currency="eth"
            placeholder="0"
            value={value}
          />
        </Stack>
      </Tooltip>
    ),
  },
  {
    field: "totalRpl",
    type: "number",
    headerName: "RPL Inflation to Node",
    width: 150,

    valueGetter: ({ row: { collateralRpl, oracleDaoRpl } }) => {
      return ethers.BigNumber.from(collateralRpl || "0").add(
        ethers.BigNumber.from(oracleDaoRpl || "0")
      );
    },
    valueFormatter: (params) => ethers.utils.formatEther(params.value || 0),
    renderCell: ({ value, row: { type } }) => (
      <Tooltip
        sx={{ cursor: "help" }}
        title={
          type === "ongoing"
            ? "This is the node’s share of RPL inflation for the interval. It will continue to grow until the end of the interval. At the end of the interval, if the node’s RPL stake is below 10% of borrowed ETH, then they receive no inflation RPL and this value becomes zero."
            : "This is the node’s share of RPL inflation for the interval."
        }
      >
        <Stack direction="row" spacing={1} alignItems="baseline">
          {type === "ongoing" && (
            <Typography
              component="span"
              variant="inherit"
              color="text.secondary"
            >
              &ge;
            </Typography>
          )}
          <CurrencyValue size="small" currency="rpl" value={value} />
        </Stack>
      </Tooltip>
    ),
  },
];

export default function NodePeriodicRewardsTable({ sx, nodeAddress, header }) {

  let finalized = useNodeFinalizedRewardSnapshots({ nodeAddress });
  let pending = useNodePendingRewardSnapshot({ nodeAddress });
  //let ongoing = useNodeOngoingRewardSnapshot({ nodeAddress });
  let columns = INTERVAL_COLS;
  let maxWidth = columns.reduce((sum, { width }) => sum + width, 0);
  let rows = []
    //The now ongoing interval, precomputed
    //.concat(ongoing ? [ongoing] : [])
    // The just-finished interval pending oDAO consensus
    .concat(pending ? [pending] : [])
    // The finished and finalized intervals ready for claiming
    .concat(finalized);
  return (
    <div style={{ display: "flex", maxWidth }}>
      <div style={{ flexGrow: 1, width: "100%" }}>
        <DataGrid
          sx={{ ...sx }}
          //slots={{ toolbar: DataToolbar }}
          slotProps={{
            toolbar: {
              header,
              fileName: `rocketsweep-node-${nodeAddress}-periodic-rewards`,
              isLoading: _.some(rows, (row) => row.isLoading),
            },
          }}
          density="compact"
          rowSelection={false}
          autoHeight
          pagination
          pageSizeOptions={[3, 10, 20, 50, 100]}
          rows={rows}
          getRowId={({ type, rewardIndex }) =>
            type === "local" ? "local" : rewardIndex
          }
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 3 } },
            sorting: {
              sortModel: [
                {
                  field: "rewardIndex",
                  sort: "desc",
                },
              ],
            },
          }}
          disableSelectionOnClick
        />
      </div>
    </div>
  );
}
