import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormHelperText,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import { ColorLensOutlined, OpenInNew } from "@mui/icons-material";
import { ethers } from "ethers";
import {
  useContract,
  useContractWrite,
  usePrepareContractWrite,
  useWebSocketProvider,
} from "wagmi";
import useMinipoolDetails from "../hooks/useMinipoolDetails";
import useEtherEvents from "../hooks/useEtherEvents";
import {
  BNSortComparator,
  distributeBalanceInterface,
  etherscanUrl,
  MinipoolStatusNameByValue,
  MinipoolStatus,
  rocketscanUrl,
  shortenAddress,
} from "../utils";
import DistributeEfficiencyAlert from "./DistributeEfficiencyAlert";
import GasInfoFooter from "./GasInfoFooter";
import CurrencyValue from "./CurrencyValue";
import useCanConnectedAccountWithdraw from "../hooks/useCanConnectedAccountWithdraw";
import useGasPrice from "../hooks/useGasPrice";
import DataToolbar from "./DataToolbar";
import _ from "lodash";

const MINIPOOL_COLS = [
  {
    field: "minipoolAddress",
    headerName: "Minipool",
    width: 165,
    renderCell: ({ value }) => (
      <>
        <Chip
          sx={{ mr: 1 }}
          size="small"
          // variant="outlined"
          // color="inherit"
          clickable
          component="a"
          target="_blank"
          href={rocketscanUrl({ minipool: value })}
          label={shortenAddress(value)}
        />
        <IconButton
          size={"small"}
          variant={"contained"}
          color={"default"}
          clickable="true"
          component="a"
          target="_blank"
          href={etherscanUrl({ address: value })}
        >
          <OpenInNew fontSize="inherit" />
        </IconButton>
      </>
    ),
  },
  {
    field: "balance",
    headerName: "Balance",
    type: "number",
    width: 120,
    sortComparator: BNSortComparator,
    valueFormatter: (params) => ethers.utils.formatEther(params.value || 0),
    valueGetter: ({ value, row }) =>
      ethers.BigNumber.from(
        row.status !== MinipoolStatus.staking ? "0" : value || "0"
      ),
    renderCell: ({ value, row }) => {
      if (!value) {
        return <CircularProgress size="1em" />;
      }
      return <CurrencyValue size="small" currency="eth" value={value} />;
    },
  },
  {
    field: "nodeBalance",
    headerName: "Your Share",
    type: "number",
    width: 120,
    sortComparator: BNSortComparator,
    valueFormatter: (params) => ethers.utils.formatEther(params.value || 0),
    valueGetter: ({ value, row }) =>
      ethers.BigNumber.from(
        row.status !== MinipoolStatus.staking ? "0" : value || "0"
      ),
    renderCell: ({ value, row }) => {
      if (!row.upgraded || value.isZero()) {
        return "";
      }
      return <CurrencyValue size="small" currency="eth" value={value} />;
    },
  },
  // Adding a new columns to display the IRR for the minipool, and the node's share of the IRR 
  {
    field: "activatedDate",
    headerName: "Activated",
    type: "date",
    width: 120,
     sortComparator: BNSortComparator,
  }, 
  {
    field: "finalizedDate",
    headerName: "Finalized",
    type: "date",
    width: 120,
     sortComparator: BNSortComparator,
  },
  {
    field: "status",
    headerName: "Status",
    width: 195,
    valueGetter: ({ value, row: { upgraded, isFinalized } }) =>
      value === MinipoolStatus.staking && isFinalized
        ? "Term Date"
        : !MinipoolStatusNameByValue[value]
        ? ""
        : upgraded
        ? MinipoolStatusNameByValue[value]
        : `${MinipoolStatusNameByValue[value] || ""} (unupgraded)`,
  },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    width: 120,
     sortComparator: BNSortComparator,
  }, 
  {
    field: "minipoolIrr",
    headerName: "IRR",
    type: "number",
    width: 120,
     sortComparator: BNSortComparator,
  },
  {
    field: "nodeIrr",
    headerName: "Operator IRR",
    type: "number",
    width: 120,
     sortComparator: BNSortComparator,
  },
  {
    field: "protocolBalance",
    headerName: "rETH Share",
    type: "number",
    width: 120,
    sortComparator: BNSortComparator,
    valueFormatter: (params) => ethers.utils.formatEther(params.value || 0),
    valueGetter: ({ value, row }) =>
      ethers.BigNumber.from(
        row.status !== MinipoolStatus.staking ? "0" : value || "0"
      ),
    renderCell: ({ value, row }) => {
      if (!row.upgraded || value.isZero()) {
        return "";
      }
      return <CurrencyValue size="small" currency="eth" value={value} />;
    },
  },

];

export default function NodeContinuousRewardsTable({
  sx,
  nodeAddress,
  header,
}) {
  let minipools = useMinipoolDetails(nodeAddress);
  //let events = useEtherEvents(minipools);
  //console.log("events:", events);
  let columns = MINIPOOL_COLS;
  let maxWidth = columns.reduce((sum, { width }) => sum + width, 0);
  return (
    <div style={{ display: "flex", maxWidth }}>
      <div style={{ flexGrow: 1, width: "100%" }}>
        <DataGrid
          sx={{ ...sx }}
          slots={{ toolbar: DataToolbar }}
          slotProps={{
            toolbar: {
              header,
              fileName: `rocketsweep-node-${nodeAddress}-continuous-rewards`,
              isLoading: _.some(minipools, (mp) => mp.isLoading),
            },
          }}
          density="compact"
          rowSelection={false}
          autoHeight
          pagination
          pageSizeOptions={[3, 10, 20, 50, 100]}
          rows={minipools.map((mp) => ({ ...mp, nodeAddress }))}
          getRowId={({ minipoolAddress }) => minipoolAddress}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 3 } },
            sorting: {
              sortModel: [
                {
                  field: "balance",
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
