import logo from './logo.svg';
import './App.css';
let API_ENDPOINT = "http://api.etherscan.io/api?";
let module =  "module=account&";
let action = "action=txsBeaconWithdrawal&";
let address = "address=0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f&";
let startblock = "startblock=0&";
let endblock = "endblock=99999999&";
let page = "page=1&";
let offset = "offset=100&";
let sort = "sort=asc&";
let apikey= "apikey=SXQC9UWX4J4CHGDX3V4HJ7YXHSCI7QTY2U";
let url = API_ENDPOINT+module+action+address+startblock+endblock+page+offset+sort+apikey
let url1 = 'http://api.etherscan.io/api?module=account&action=txsBeaconWithdrawal&address=0xb3684a0BB31Cde887bf02DBFc5738ebAF29a153A&startblock=0&endblock=99999999&page=1&offset=100&sort=asc&apikey=SXQC9UWX4J4CHGDX3V4HJ7YXHSCI7QTY2U'

const irr = await fetch(url);
const data = await irr.json();
const irr1 = await fetch(url1);
const data1 = await irr1.json();
console.log("URL", url, "Withdrawls:", data);
console.log("URL1", url1, "Withdrawls1:", data1);
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
