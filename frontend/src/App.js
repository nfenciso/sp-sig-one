import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from "./pages/Home";
import Entrylist from "./pages/Entrylist";

function App() {

  return (
    <>
    {/* <div className="App"> */}
      <BrowserRouter>
        <Routes>
          <Route exact={true} path="/" element={<Home />} />
          {/* <Route exact={true} path="/login" element={<Login />} /> */}
          <Route exact={true} path="/entrylist" element={<Entrylist />} />
        </Routes>
      </BrowserRouter>
    {/* </div> */}
    </>
  );
}

export default App;
