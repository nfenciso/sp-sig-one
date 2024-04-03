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

import QRCode from "qrcode";

const Entrylist = () => {

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("user") ? true : null);
    const [entries, setEntries] = useState(null);
    const [qrCodes, setQrCodes] = useState(null);

    const fetchAllEntries = async () => {
        await postFetch(`${baseURL}/get-personal-entries`, {
            email: JSON.parse(localStorage.getItem("user")).email
        }).then((res)=>{
            setEntries(res.results);
            console.log(res.results);

            let qrList = Array.from({ length: res.results.length }, (_, k) => 0);

            res.results.map((entry, index)=>{
                QRCode.toDataURL(entry._id, { errorCorrectionLevel: 'H' }, function (err, url) {
                    qrList[index] = url;
                });
            });

            setQrCodes(qrList);
        });
    };
    
    useEffect(()=>{
        let userString = localStorage.getItem("user");

        if (userString) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }

    }, []);

    useEffect(()=>{
        if (isLoggedIn) {
            fetchAllEntries();
        }
    }, [isLoggedIn]);

    //style={{ backgroundColor: "#f3f4f6" }}
    return(
        <div style={{overflow: "hidden"}}>
            <NavigationBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Container fluid>
                {   
                    isNull(isLoggedIn) ?
                    null :
                    isLoggedIn ?
                    isNull(qrCodes) ?
                    null :
                    qrCodes.length == 0 ?
                    <Row style={{marginTop: "30px"}}>
                        <Col  className="my-1 mx-auto" key="00" >
                        <Card >
                            <Card.Img variant="top" />
                            <Card.Body>
                                <h4 style={{textAlign: "center"}}>No QR Code Entries added yet.</h4>
                            </Card.Body>
                        </Card>
                        </Col>
                    </Row> :
                    <Row 
                        style={{
                            backgroundColor: "#204183", 
                            //paddingBottom: "100px",
                            paddingLeft: "2vw",
                            paddingRight: "2vw", 
                            width: "100vw",
                        }} >
                    {
                        entries.map((entry, index) => {
                            return(
                                <Col 
                                    xs={11} sm={5} md={4} lg={3} xl={2} 
                                    className="list-col-entries mb-4" 
                                    key={entry._id}
                                    >
                                <Card >
                                    {/* <Card.Img variant="top" src={sampleQR} /> */}
                                    <Card.Img variant="top" src={qrCodes[index]} />
                                    <Card.Body>
                                        <Card.Title>{entry.entryTitle}</Card.Title>
                                        <p>Created at {new Date(entry.dateGenerated).toLocaleString()}</p>
                                        <p>{entry.subEntriesCount} Subentries</p> 
                                        <Button 
                                            variant="primary" 
                                            onClick={()=>{
                                                navigate(`/view-entry/${entry._id}`);
                                            }}
                                            // disabled={entry.subEntriesCount == 0}
                                        >View details</Button>
                                    </Card.Body>
                                </Card>
                                </Col>
                                // </Row>
                            )
                        })
                    }
                    </Row> :
                    <Row>
                        <Col className="my-1 mx-auto px-5 mt-3" key="00" >
                        <Card >
                            <Card.Img variant="top" />
                            <Card.Body>
                                <h4 style={{textAlign: "center"}}>Login through your Google Account to create your own QR Code Entries.</h4>
                            </Card.Body>
                        </Card>
                        </Col>
                    </Row>
                }
            </Container>
        </div>
    )
}

export default Entrylist;