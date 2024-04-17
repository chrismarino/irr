import { BrowserRouter as Router, useRoutes, HashRouter } from 'react-router-dom';
import NodeNative from "./pages/NodeNative";
import NodeFiat from "./pages/NodeFiat";
import MinipoolNative from "./pages/MinipoolNative";
import MinipoolFiat from "./pages/MinipoolFiat";
import PeriodicRewards from "./pages/PeriodicRewards";
import About from "./pages/About";
import Topoff from "./pages/Topoff";

function Routes() {
  const routing = useRoutes([
    { path: '',  element: <NodeNative /> },
    { path: 'node-fiat', element: <NodeFiat /> },
    { path: 'minipools-native',  element: <MinipoolNative /> },
    { path: 'minipools-fiat', element: <MinipoolFiat /> },
    { path: 'rewards', element: <PeriodicRewards /> },
    { path: 'topoff', element: <Topoff /> },
    { path: 'about', element: <About /> },
  ]);
  return routing;
}

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes />
    </Router>
  );
}
export default App;
