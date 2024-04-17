import { DataGrid } from "@mui/x-data-grid";
import { Button, Stack, Tooltip, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import moment from "moment";
import React, { useState, useEffect, useContext } from 'react';
import CurrencyValue from "../components/CurrencyValue";
import useNodeFinalizedRewardSnapshots from "../hooks/useNodeFinalizedRewardSnapshots";
import useNodePendingRewardSnapshot from "../hooks/useNodePendingRewardSnapshot";
import useNodeOngoingRewardSnapshot from "../hooks/useNodeOngoingRewardSnapshot";
import DataContext from '../components/DataContext';

//import DataToolbar from "./DataToolbar";
import _ from "lodash";


// Create a client


const INTERVAL_COLS = [
  {
    field: "rewardIndex",
    headerName: "Interval",
    width: 150,
    renderCell: ({
      row: { type, rewardIndex, endTime, file, nodeAddressOrName },
    }) => {
      let when = endTime ? moment(1000 * endTime) : null;
      return (
        <Stack
          sx={{ width: "100%" }}
          direction="row"
          alignItems="baseline"
          justifyContent="flex-start"
        >
          #{rewardIndex}
          <Typography sx={{ pl: 1 }} variant="caption" color="text.secondary">
            {`${when?.fromNow() || "ongoing"}`}
          </Typography>
        </Stack>
      );
    },
  },
  {
    field: "endTime",
    headerName: "Ended",
    width: 125,
    sortable: false,
    valueFormatter: (params) => {
      let { endTime, type } = params.api.getRow(params.id);
      let when = endTime ? moment(1000 * endTime) : null;
      if (type === "ongoing") {
        return "ongoing";
      }
      return when?.format("YYYY-MM-DD") || "";
    },
  },
  {
    field: "isClaimed",
    type: "string",
    headerName: "Claimed",
    width: 75,
    align: 'center',
    valueFormatter: (params) => params.value ? "Yes" : "No",
  },
  {
    field: "smoothingPoolEth",
    type: "number",
    headerName: "Smoothing Pool",
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
    headerName: "Inflation",
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

export default function NodePeriodicRewardsTable({ sx, header }) {
  const { nodeAddress, nodePeriodicRewards } = useContext(DataContext);
  if (nodeAddress === "") return
  let columns = INTERVAL_COLS;
  let maxWidth = columns.reduce((sum, { width }) => sum + width, 0);
  const rows = nodePeriodicRewards;

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
          pageSizeOptions={[10, 20, 50, 100]}
          rows={rows}
          getRowId={({ type, rewardIndex }) =>
            type === "local" ? "local" : rewardIndex
          }
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
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
