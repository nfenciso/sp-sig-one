import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from "./pages/Home";
import Entrylist from "./pages/Entrylist";
import EntryPage from "./pages/EntryPage";

function App() {

  return (
    <>
    {/* <div className="App"> */}
      <BrowserRouter>
        <Routes>
          {/* <Route exact={true} path="/" element={<Home />} /> */}
          {/* <Route exact={true} path="/login" element={<Login />} /> */}
          <Route exact={true} path="/" element={<Entrylist />} />
          <Route exact={true} path="/entry/:id" element={<EntryPage />} />
        </Routes>
      </BrowserRouter>
    {/* </div> */}
    </>
  );
}

export default App;
