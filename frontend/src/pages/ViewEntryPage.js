import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import NavigationBar from "./components/NavigationBar";

import { baseURL } from "../utils/constants";
import { postFetch } from "../utils/requests";
import { Container, Row, Col, Card } from "react-bootstrap";
import { isNull } from "lodash";

const ViewEntryPage = () => {
    
    const { id } = useParams();

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("user") ? true : null);
    const [subentries, setSubentries] = useState([]);
    const [entryDetails, setEntryDetails] = useState(null);
    const email = useRef(null);

    const fetchAppropriateSubentries = async () => {
        await postFetch(`${baseURL}/get-appropriate-subentries`, {
            entryId: id,
            email: email.current
        }).then((res)=>{
            setSubentries(res.results);
        });
    };

    const fetchAppropriateDetails = async () => {
        await postFetch(`${baseURL}/check-entry-access`, {
            entryId: id,
            email: email.current
        }).then((res)=>{
            if (res.access) {
                setEntryDetails(res.results);
                fetchAppropriateSubentries();
            } else {
                setEntryDetails(403);
            }
        });
    }
    
    useEffect(()=>{
        let userString = localStorage.getItem("user");
        email.current = JSON.parse(userString).email;

        if (userString) {
            setIsLoggedIn(true);
            fetchAppropriateDetails();
            
        }

    }, []);

    return(
        <>
            <NavigationBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Container>
            {
                isNull(isLoggedIn) ?
                null :
                !isNull(entryDetails) ? 
                entryDetails != 403 ?
                <>
                <Row className="mb-3 bg-white mx-auto p-3 pb-1" >
                <h3>{entryDetails.entryTitle}</h3>
                <p>This entry was created by {entryDetails.userEmail} at {new Date(entryDetails.dateGenerated).toLocaleString()}.</p>
                </Row>
                {
                subentries?.map((subentry)=>{
                    return(
                        <Row className="mb-3 bg-white mx-auto" key={subentry.index}>
                            <Col lg={3} className="list-left-col-subentries p-3"
                            >
                            <div>{subentry.subentryTitle}</div>
                            </Col>
                            <Col className="list-right-col-subentries p-3">
                            {subentry.content}
                            </Col>
                        </Row>
                    );
                })
                }
                </> 
                :
                <Row>
                        <Col className="my-1 mx-auto px-5 mt-3" key="00" >
                        <Card >
                            <Card.Img variant="top" />
                            <Card.Body>
                                <h4 style={{textAlign: "center"}}>You do not have access to this particular entry.</h4>
                            </Card.Body>
                        </Card>
                        </Col>
                    </Row>
                : null
            }
            </Container>
        </>
    );
};

export default ViewEntryPage;