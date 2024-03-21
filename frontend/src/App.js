import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from "./pages/Home";
import Entrylist from "./pages/Entrylist";
import PersonalEntryPage from "./pages/PersonalEntryPage";
import CreateEntry from "./pages/CreateEntry";
import ViewEntryPage from "./pages/ViewEntryPage";

function App() {

  return (
    <>
    {/* <div className="App"> */}
      <BrowserRouter>
        <Routes>
          {/* <Route exact={true} path="/" element={<Home />} /> */}
          {/* <Route exact={true} path="/login" element={<Login />} /> */}
          <Route exact={true} path="/" element={<Entrylist />} />
          <Route exact={true} path="/personal-entry/:id" element={<PersonalEntryPage />} />
          <Route exact={true} path="/create-entry/" element={<CreateEntry />} />
          <Route exact={true} path="/view-entry/:id" element={<ViewEntryPage />} />
        </Routes>
      </BrowserRouter>
    {/* </div> */}
    </>
  );
}

export default App;
