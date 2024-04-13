import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from "./pages/Home";
import Entrylist from "./pages/Entrylist";
import PersonalEntryPage from "./pages/PersonalEntryPage";
import CreateEntry from "./pages/CreateEntry";
import ViewEntryPage from "./pages/ViewEntryPage";
import ScannerPage from "./pages/ScannerPage";
import PDFPage from "./pages/PDFPage";
import ScannerPDFPage from "./pages/ScannerPDFPage";

function App() {

  return (
    <>
    <div className="App" style={{backgroundColor: "#204183", paddingBottom: "40px"}}  >
      <BrowserRouter>
        <Routes>
          {/* <Route exact={true} path="/" element={<Home />} /> */}
          {/* <Route exact={true} path="/login" element={<Login />} /> */}
          <Route exact={true} path="/" element={<Entrylist />} />
          {/* <Route exact={true} path="/personal-entry/:id" element={<PersonalEntryPage />} /> */}
          <Route exact={true} path="/create-entry/" element={<CreateEntry />} />
          <Route exact={true} path="/view-entry/:id" element={<ViewEntryPage />} />
          <Route exact={true} path="/pdf" element={<PDFPage />} />
          <Route exact={true} path="/scan-camera" element={<ScannerPage />} />
          <Route exact={true} path="/scan-pdf" element={<ScannerPDFPage />} />
        </Routes>
      </BrowserRouter>
    </div>
    </>
  );
}

export default App;
