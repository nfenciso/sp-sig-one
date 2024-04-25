import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, NavDropdown, Nav, Navbar, Row, Col, Card, Spinner } from 'react-bootstrap/'
// import { GoogleLogin } from '@react-oauth/google';
import sampleQR from '../assets/sampleqr.png';
// import { jwtDecode } from "jwt-decode";

import NavigationBar from "./components/NavigationBar";

import { baseURL } from "../utils/constants";
import { postFetch } from "../utils/requests";
import { isNull } from "lodash";

import QrReader from "./components/Scanner";

var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

const ScannerPage = () => {

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("user") ? true : null);

    // Result
    const [scannedResult, setScannedResult] = useState(null);
    
    useEffect(()=>{
        let userString = localStorage.getItem("user");

        if (userString) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }

    }, []);

    useEffect(()=>{
        if (scannedResult) {
            let partResult = scannedResult.split("/");
            partResult = partResult[partResult.length - 1];
            if (partResult.charAt(partResult.length - 1) == "/") {
                partResult = partResult.slice(0, -1);
            }

            if (checkForHexRegExp.test(partResult)) {
                navigate(`/view-entry/${partResult}`);
            } else {
                alert(scannedResult);
                setScannedResult(null);
            }
        }
    },[scannedResult]);

    //style={{ backgroundColor: "#f3f4f6" }}
    return(
        <div style={{overflow: "hidden"}}>
            <NavigationBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Container fluid>
                <QrReader 
                    scannedResult={scannedResult}
                    setScannedResult={setScannedResult}
                />
            </Container>
        </div>
    )
}

export default ScannerPage;