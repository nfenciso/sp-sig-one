import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import NavigationBar from "./components/NavigationBar";

import { baseURL } from "../utils/constants";
import { postFetch } from "../utils/requests";
import { Container, Row, Col, Card } from "react-bootstrap";
import { isNull } from "lodash";

const PersonalEntryPage = () => {
    
    const { id } = useParams();

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("user") ? true : null);
    const [subentries, setSubentries] = useState([]);
    const [entryDetails, setEntryDetails] = useState(null);

    const fetchAllSubentries = async () => {
        await postFetch(`${baseURL}/get-personal-subentries`, {
            entryId: id
        }).then((res)=>{
            setSubentries(res.results);
        });
    };

    const fetchDetails = async () => {
        await postFetch(`${baseURL}/get-personal-singular-entry`, {
            entryId: id
        }).then((res)=>{
            setEntryDetails(res.results);
        });
    }
    
    useEffect(()=>{
        let userString = localStorage.getItem("user");

        if (userString) {
            setIsLoggedIn(true);
            fetchDetails();
            fetchAllSubentries();
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
                <>
                <Row className="mb-3 bg-white mx-auto p-3" >
                <h3>{entryDetails.entryTitle}</h3>
                <p>Created at {new Date(entryDetails.dateGenerated).toLocaleString()}</p>
                <div>
                    General Permissions:
                    {entryDetails.generalPermission.map((perm)=>{
                        return(
                            <div key={entryDetails.index+perm.value}>
                            
                            <span>- {perm.value}{['public','private'].includes(perm.value) ? "" : ":"} {perm.details}</span>
                            </div>
                        );
                    })}
                </div>
                </Row>
                {
                subentries?.map((subentry)=>{
                    return(
                        <Row className="mb-3 bg-white mx-auto" key={subentry.index}>
                            <Col lg={3} className="list-left-col-subentries p-3"
                            >
                            <div>{subentry.index}: {subentry.subentryTitle}</div>
                            <hr />
                            <div>
                                Specific Permissions:
                                {subentry.specificPermission.map((perm)=>{
                                    return(
                                        <div key={subentry.index+perm.value}>
                                        
                                        <span>- {perm.value}{['public','private'].includes(perm.value) ? "" : ":"} {perm.details}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            </Col>
                            <Col className="list-right-col-subentries p-3">
                            {subentry.content}
                            </Col>
                        </Row>
                    );
                })
                }
                </> 
                : null
            }
            </Container>
        </>
    );
};

export default PersonalEntryPage;