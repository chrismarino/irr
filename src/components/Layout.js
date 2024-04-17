import {
  AppBar,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Link,
  Modal,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, Tab } from '@mui/material';
import { HelpOutline, Settings } from "@mui/icons-material";
import { useState, useEffect } from "react";
import React from 'react';
import SettingsList from "./SettingsList";

function FAQ() {
  let theme = useTheme();
  return (
    <Stack spacing={1} sx={{ m: 1, pb: 1, color: theme.palette.text.primary }}>
      <Typography variant="h6">About</Typography>
      <Typography variant="body2">
        A tool for  Rocket Pool operators to track the returns of their node and minipools. 
      </Typography>
      <Typography variant="h6">How does it work?</Typography>
      <Typography variant="body2">
        It fetches your node and minipool data, as well as the deposit history to caclculate returns.
        IRR calculations consider the timing of Minipool creation and reward claims and distributions to 
        calculate an accurate internal rate of return. Allocates Smooting Pool and Inflation rewards 
        across available minipools to help you understand the total returns of each minipool.
      </Typography>
      <Typography variant="h6">Author</Typography>
      <Typography variant="body2">
        <Link
          href="https://github.com/chrismarino"
          target="_blank"
          color="inherit"
          underline="always"
        >Chris Marino
        </Link>
      
      </Typography>
      <Typography variant="h6">Source/Issues</Typography>
      <Typography variant="body2">
        <Link
          href="https://github.com/chrismarino/rocketreturns"
          target="_blank"
          color="inherit"
          underline="always"
        >
          rocketreturns
        </Link><br></br>
        <Link
          href="https://github.com/chrismarino/rocketreturns/issues"
          target="_blank"
          color="inherit"
          underline="always"
        >
          rocketreturns/issues
        </Link>
      </Typography>
    </Stack>
  );
}

function SettingsButton({ sx }) {
  let [isOpen, setOpen] = useState(false);
  return (
    <>
      <IconButton onClick={() => setOpen(true)} sx={sx}>
        <Settings />
      </IconButton>
      <Modal
        open={isOpen}
        onClose={() => setOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card sx={{ width: "95%", maxWidth: 500 }}>
          <CardHeader title={"Settings"} />
          <CardContent>
            <SettingsList />
          </CardContent>
        </Card>
      </Modal>
    </>
  );
}

export default function Layout({ children }) {
  const tabNameToIndex = {
    '': 0,
    //'node-native': 0,
    'node-fiat': 1,
    'minipools-native': 2,
    'minipools-fiat': 3,
    'rewards': 4,
    'topoff': 5,
    'about': 6,
  };
  
  const indexToTabName = {
     0: '',
    //0: 'node-native',
    1: 'node-fiat',
    2: 'minipools-native',
    3: 'minipools-fiat',
    4: 'rewards',
    5: 'topoff',
    6: 'about',
  };
  
  const [value, setValue] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const initialTab = tabNameToIndex[location.pathname.substring(1)];
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
    navigate(`/${indexToTabName[newValue]}`);
  };

  // useEffect(() => {
  //   // Redirect to '/node-native' when the component mounts
  //   navigate('/node-native');
  // }, []);
  
  return (

    <Box
      sx={{
        display: "flex",
      }}
    >
      <AppBar component="nav" color="default">
        <Toolbar disableGutters>
          <Tooltip arrow title={<FAQ />}>
            <Typography
              variant="h6"
              sx={{
                pl: 2,
                color: "inherit",
                textDecoration: "none",
              }}
              component={RouterLink}
              to={"/"}
            >
              Rocket Returns <HelpOutline sx={{ ml: 1 }} fontSize="inherit" />
            </Typography>
          </Tooltip>
          <Box sx={{ flexGrow: .8 }} />
          <div style={{ display: 'flex', justifyContent: 'center', zIndex: 9999 }}>
            <Tabs value={activeTab} onChange={handleChange} >
              {/* <Tab label="Home" component={RouterLink} to="/" /> */}
              <Tab label={<><span style={{ lineHeight: '0.3' }}>Node</span><br /><span style={{ lineHeight: '0.3' }}>Native</span></>} component={RouterLink} to="/" />
              <Tab label={<><span style={{ lineHeight: '0.3' }}>Node</span><br /><span style={{ lineHeight: '0.3' }}>Fiat</span></>} component={RouterLink} to="/node-fiat" />
              <Tab label={<><span style={{ lineHeight: '0.3' }}>Minipools</span><br /><span style={{ lineHeight: '0.3' }}>Native</span></>} component={RouterLink} to="/minipools-native" />
              <Tab label={<><span style={{ lineHeight: '0.3' }}>Minipools</span><br /><span style={{ lineHeight: '0.3' }}>Fiat</span></>} component={RouterLink} to="/minipools-fiat" />
              <Tab label={<><span style={{ lineHeight: '0.3' }}>Periodic</span><br /><span style={{ lineHeight: '0.3' }}>Rewards</span></>} component={RouterLink} to="/rewards" />
              <Tab label={<><span style={{ lineHeight: '0.3' }}>RPL</span><br /><span style={{ lineHeight: '0.3' }}>Topoff</span></>} component={RouterLink} to="/topoff" />
              <Tab label="About" component={RouterLink} to="/about" />
            </Tabs></div>
          <Box sx={{ flexGrow: 1 }} />
          <SettingsButton />
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
        }}
      >
        <Toolbar />

        <Stack sx={{ width: "100%", pt: 3, pl: 3, pr: 3 }}>{children}</Stack>
      </Box>
    </Box>

  );
}
