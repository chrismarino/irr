import logo from './logo.svg';
import './App.css';
let appUrl = process.env.REACT_APP_ETHERSCAN_URL
let apikey = process.env.REACT_APP_ETHERSCAN_KEY
let module =  "module=account&";
let action = "action=txsBeaconWithdrawal&";
let address = "address=0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f&";
let startblock = "startblock=0&";
let endblock = "endblock=99999999&";
let page = "page=1&";
let offset = "offset=100&";
let sort = "sort=asc&";
let url = (appUrl+module+action+address+startblock+endblock+page+offset+sort+ "apikey=" + apikey)

const irr = await fetch(url);
const data = await irr.json();
console.log("URL", url, "Withdrawls:", data);
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
