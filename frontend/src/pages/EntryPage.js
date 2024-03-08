import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import NavigationBar from "./components/NavigationBar";

import { baseURL } from "../utils/constants";
import { postFetch } from "../utils/requests";
import { Container, Row, Col, Card } from "react-bootstrap";
import { isNull } from "lodash";

const EntryPage = () => {
    
    const { id } = useParams();

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("user") ? true : null);
    const [subentries, setSubentries] = useState([]);

    const fetchAllSubentries = async () => {
        await postFetch(`${baseURL}/get-personal-subentries`, {
            entryId: id
        }).then((res)=>{
            setSubentries(res.results);
        });
    };
    
    useEffect(()=>{
        let userString = localStorage.getItem("user");

        if (userString) {
            setIsLoggedIn(true);
            fetchAllSubentries();
        }

    });

    return(
        <>
            <NavigationBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Container className="mt-3">
            {
                isNull(isLoggedIn) ?
                null :
                subentries.length > 0 ? 
                subentries.map((subentry)=>{
                    return(
                        <Row className="p-3 mb-3 bg-white" key={subentry.index}>
                            <Col lg={4}>
                            {subentry.subentryTitle}
                            </Col>
                            <Col>
                            {subentry.content}
                            </Col>
                        </Row>
                    );
                }) : null
            }
            </Container>
        </>
    );
};

export default EntryPage;