// import './App.css';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./components/NavBar";
import MapOkkar from "./components/MapOkkar";
import Map from "./components/Map";

// import Data from './components/Data'

const App = () => {
  return (
    <div className="App">
      <NavBar />
      <Map/>
    </div>
  );
};

export default App;
