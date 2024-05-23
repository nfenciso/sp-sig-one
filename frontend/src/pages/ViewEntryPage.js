import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import NavigationBar from "./components/NavigationBar";

import { baseURL } from "../utils/constants";
import { postFetch } from "../utils/requests";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { isNull } from "lodash";

import { AiOutlineLoading3Quarters } from "react-icons/ai";

const PUBLIC_OPTION = "public";
const ORG_OPTION = "org";
const PERSONS_OPTION = "persons";
const PRIVATE_OPTION = "private";

const S_RETAIN_OPTION = "retain";
const S_PRIVATIZE_OPTION = "privatize";
const S_NEWTYPE_ORG_OPTION = "neworg";
const S_NEWTYPE_PERSONS_OPTION = "newpersons";
const S_MORE_SPECIFIC_ORG_OPTION = "morespecificorg";
const S_MORE_SPECIFIC_PERSONS_OPTION = "morespecificpersons";

const ViewEntryPage = () => {
    
    const { id } = useParams();

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("user") ? true : null);
    const [subentries, setSubentries] = useState([]);
    const [loadedSubentries, setLoadedSubentries] = useState(false);
    const [entryDetails, setEntryDetails] = useState(null);
    const email = useRef(null);
    const [isOwner, setIsOwner] = useState(null);

    const fetchAppropriateSubentries = async (generalPermission) => {
        await postFetch(`${baseURL}/get-appropriate-subentries`, {
            entryId: id,
            email: email.current,
            generalPermission
        }).then((res)=>{
            setLoadedSubentries(true);
            document.body.style.overflowY = "auto";
            setSubentries(res.results);
            //console.log(res.results);
        });
    };

    const fetchAppropriateDetails = async () => {
        await postFetch(`${baseURL}/check-entry-access`, {
            entryId: id,
            email: email.current
        }).then((res)=>{
            if (res?.access) {
                //console.log(res);
                setIsOwner(res.isOwner);
                setEntryDetails(res.results);
                //console.log(res.results);
                fetchAppropriateSubentries(res.results.generalPermission);
            } else {
                document.body.style.overflowY = "auto";
                setEntryDetails(403);
            }
        });
    }
    
    useEffect(()=>{
        document.body.style.overflowY = "hidden";

        let userString = localStorage.getItem("user");
        email.current = JSON.parse(userString)?.email;

        if (userString) {
            setIsLoggedIn(true);
            fetchAppropriateDetails();
            
        } else {
            console.log("not logged in");
            email.current = "public";
            fetchAppropriateDetails();
        }

    }, []);

    useEffect(()=>{
        let userString = localStorage.getItem("user");
        email.current = JSON.parse(userString)?.email;

        if (!userString) {
            email.current = "public";
        }

        fetchAppropriateDetails();
    },[isLoggedIn]);

    return(
        <>
            <NavigationBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Container>
            {
                // isNull(isLoggedIn) ?
                // null :
                !isNull(entryDetails) ? 
                entryDetails != 403 ?
                <>
                <Row className="mb-3 bg-white mx-auto p-3 pb-1" >
                <h3>{entryDetails.entryTitle}</h3>
                <p>This entry was generated by <b>{entryDetails.userEmail}</b> at <b>{new Date(entryDetails.dateGenerated).toLocaleString()}</b> to express approval, support, and/or provide information or context from which the QR Code is attached.</p>
                {
                    isOwner ? 
                    <div className="pb-3">
                        General Permissions: {entryDetails.generalPermission[0]}
                        {[PUBLIC_OPTION, PRIVATE_OPTION].includes(entryDetails.generalPermission[0])? null :
                            entryDetails.generalPermission[1].map((val)=>{
                                return(
                                    <div key={"entry"+val.value}>
                                        - {val.value}
                                    </div>
                                );
                            })
                        }
                    </div> : null
                }
                </Row>
                {
                    loadedSubentries ?
                subentries?.map((subentry)=>{
                    return(
                        <Row className="mb-3 bg-white mx-auto" key={subentry.index}>
                            <Col lg={3} className="list-left-col-subentries p-3"
                            >
                            <div>{
                                isOwner ?
                                <>{subentry.index}: </>
                                :
                                null    
                            }{subentry.subentryTitle}</div>
                            {
                                isOwner ? 
                                <>
                                <hr />
                                <div>
                                    Specific Permissions: {subentry.specificPermission[subentry.specificPermission.length-2]}
                                    {subentry.specificPermission[subentry.specificPermission.length-1].map((perm)=>{
                                        return(
                                            <div key={subentry.index+perm.value}>
                                            
                                            <span>- {perm.value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                </>
                                :
                                null
                            }
                            </Col>
                            <Col className="list-right-col-subentries p-3" 
                                style={{overflow: "auto", wordBreak: "break-all", whiteSpace: "normal", maxHeight: "42vh",
                                        position: "relative"}}
                            >
                            {
                                subentry.type == "text" ?
                                subentry.content
                                :
                                <div>
                                <img className="image-to-view" src={subentry.content} />
                                {/* <div
                                style={{
                                    position: "absolute", 
                                    bottom: "0px", 
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    padding: "4px",
                                    }}>hello
                                </div> */}
                                {/* <Button onClick={()=>{
                                    var image = new Image();
                                    image.src = subentry.content;

                                    var string = `<html style="height: 100%;"><head><meta name="viewport" content="width=device-width, minimum-scale=0.1"><title>wNr8YaoI1937wAAAABJRU5ErkJggg== (2000×1414)</title></head><body style="margin: 0px; height: 100%; background-color: rgb(14, 14, 14);"><img style="display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;" src=${subentry.content} width="971" height="686" ></body></html>`;//width="971" height="686"
                            
                                    var w = window.open("");
                                    w.document.write(string);
                                    w.document.close();
                                }}>View Image</Button> */}
                                {/* <a href={subentry.content} target="_blank">View Image</a> */}
                                </div>
                            }
                            </Col>
                        </Row>
                    );
                })
                    : <Row><AiOutlineLoading3Quarters className="loading" color="white"  /></Row>
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
                : 
                <Row><AiOutlineLoading3Quarters className="loading" color="white"  /></Row>
            }
            </Container>
        </>
    );
};

export default ViewEntryPage;