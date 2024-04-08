import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import NavigationBar from "./components/NavigationBar";

import { baseURL } from "../utils/constants";
import { postFetch } from "../utils/requests";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { clone, cloneDeep, isNull, values } from "lodash";

const CHOOSE_OPTION = "-1";
const PUBLIC_OPTION = "public";
const ORG_OPTION = "org";
const PERSONS_OPTION = "persons";
const PRIVATE_OPTION = "private";
const SAME_AS_GENERAL_OPTION = "99";
const OPTIONS_ARRAY = [PUBLIC_OPTION, ORG_OPTION, PERSONS_OPTION, PRIVATE_OPTION];
const DEFAULT_SUB = [
    // {
    //     index: 0,
    //     subtitle: "",
    //     type: "text",
    //     content: "",
    //     specificPermissions: [{
    //         index: 0,
    //         value: PUBLIC_OPTION
    //     }] 
    // }
];
const DEFAULT_GEN = [
    {
        index: 0,
        value: PUBLIC_OPTION
    }
];

const CreateEntry = () => {

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("user") ? true : null);
    const [entryTitle, setEntryTitle] = useState("");
    const [subentries, setSubentries] = useState(DEFAULT_SUB);

    const [genPermissions, setGenPermissions] = useState(DEFAULT_GEN);
    const [isPublicPrivate, setIsPublicPrivate] = useState(true);
    const [genPermValues, setGenPermValues] = useState([PUBLIC_OPTION]);

    const postCreateEntry = async () => {
        await postFetch(`${baseURL}/create-entry`, {
            userEmail: JSON.parse(localStorage.getItem("user")).email,
            entryTitle,
            subentriesCount: subentries.length,
            generalPermission: genPermissions,
            subentries
        }).then((res)=>{
            setEntryTitle("");
            setSubentries(DEFAULT_SUB);
            setGenPermissions(DEFAULT_GEN);
            console.log(res);
        });
    };
    
    useEffect(()=>{
        let userString = localStorage.getItem("user");

        if (userString) {
            setIsLoggedIn(true);
        }

    }, []);

    useEffect(()=>{
        if ([PUBLIC_OPTION, PRIVATE_OPTION].includes(genPermissions[0].value)) {
            setIsPublicPrivate(true);
        } else {
            setIsPublicPrivate(false);
        }
        setGenPermValues(genPermissions.map((perm)=>{return perm.value}));
    }, [genPermissions]);

    return(
        <div style={{backgroundColor: "#204183"}}>
            <NavigationBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Container>
            {/*  data-bs-theme="dark" */}
            <Card className="p-3 pb-0 mb-3">
            <Form.Group as={Row} controlId="formPlaintextEmail">
                <Form.Label column xs={3} md={2}>
                Entry Title
                </Form.Label>
                <Col>
                <Form.Control 
                    type="text" 
                    placeholder="Enter Entry Title here"
                    value={entryTitle}
                    onChange={(e)=>{
                        setEntryTitle(e.target.value);
                    }} 
                />
                </Col>
            </Form.Group>
            <hr />
            <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
                <Form.Label column xs={3} md={2}>
                General Permissions
                </Form.Label>
                <Col xs={8} md={10}>
                {
                    genPermissions.map((perm)=>{
                        return(
                            <div key={"gen"+perm.index}>
                            <Row>
                            <Col>
                            <Form.Select
                            className="mb-2"
                            value={perm.value}
                            onChange={(e)=>{
                                let newval = e.target.value;
                                let newgen;
                                if ([PUBLIC_OPTION, PRIVATE_OPTION].includes(newval)) {
                                    newgen = [
                                        {
                                            index: 0,
                                            value: newval
                                        }
                                    ];
                                    setGenPermissions(newgen);
                                } else {
                                    newgen = cloneDeep(genPermissions);
                                    newgen[perm.index].value = newval;
                                    setGenPermissions(newgen);
                                }
                                let newSubentries = cloneDeep(subentries);
                                newSubentries.map((nsub)=>{
                                    nsub.specificPermissions = newgen;
                                });
                                setSubentries(newSubentries);
                            }}
                            aria-label="General permission select" >
                            {
                                perm.index != 0 ? 
                                <option value={CHOOSE_OPTION}>Choose Permission</option> : null
                            }
                            {
                                
                            }
                            <option value={PUBLIC_OPTION}>Public</option>
                            {
                                genPermValues.includes(ORG_OPTION) && perm.index != genPermValues.indexOf(ORG_OPTION) ?
                                null :
                                <option value={ORG_OPTION}>Organization</option>
                            }
                            {
                                genPermValues.includes(PERSONS_OPTION) && perm.index != genPermValues.indexOf(PERSONS_OPTION) ?
                                null :
                                <option value={PERSONS_OPTION}>Specific Persons</option>
                            }
                            <option value={PRIVATE_OPTION}>Private</option>
                            </Form.Select>
                            </Col>
                            <Col xs={1} md={2}>
                            </Col>
                            </Row>
                            <Row>
                            {/* <Col xs={1} md={1}>
                            </Col> */}
                            <Col>
                            {
                                [ORG_OPTION, PERSONS_OPTION].includes(perm.value) ? 
                                <>
                                <Form.Control type="text" 
                                data-bs-theme="dark"
                                className="mb-2"
                                placeholder={
                                    perm.value == ORG_OPTION ? "Ex. @up.edu.ph,@gbox.adnu.edu.ph [Separate by commas]"
                                    : "Ex. johndoe@gmail.com,janedoe@gmail.com [Separate by commas]"
                                } 
                                value={perm.details ?? ""}
                                onChange={(e)=>{
                                    let newval = e.target.value;
                                    let newgen = cloneDeep(genPermissions);
                                    newgen[perm.index].details = newval;
                                    setGenPermissions(newgen);

                                    let newSubentries = cloneDeep(subentries);
                                    newSubentries.map((nsub)=>{
                                        nsub.specificPermissions = newgen;
                                    });
                                    setSubentries(newSubentries);
                                }}
                                />
                                </>
                                : null
                            }
                            </Col>
                            <Col xs={4} md={2}>
                            </Col>
                            </Row>
                            </div>
                        );
                    })
                }
                <Row>
                <Col md={6}>
                <Button className="mb-1" 
                    variant={
                        genPermissions.length >= 2 ? "danger" : "warning"
                    } 
                    disabled={isPublicPrivate}
                    onClick={()=>{
                        let newgen;
                        if (genPermissions.length >= 2) {
                            newgen = cloneDeep(genPermissions);
                            newgen.splice(1, 1);
                            // newgen.map((sub)=>{
                            //     sub.index = newgen.indexOf(sub);
                            // });
                            setGenPermissions(newgen);
                        }
                        else {
                            newgen = cloneDeep(genPermissions);
                            newgen.push({
                                index: genPermissions.length,
                                value: CHOOSE_OPTION
                            });

                            setGenPermissions(newgen);
                        }

                        let newSubentries = cloneDeep(subentries);
                        newSubentries.map((nsub)=>{
                            nsub.specificPermissions = newgen;
                        });
                        setSubentries(newSubentries);
                    }
                }>{
                    genPermissions.length >= 2 ? "Delete" : "Add"
                } 2nd Option</Button>
                {/* <Button className="mb-1" variant="danger"
                    disabled={genPermissions.length <= 1}
                    onClick={()=>{
                        let newgen = cloneDeep(genPermissions);
                        newgen.splice(1, 1);
                        // newgen.map((sub)=>{
                        //     sub.index = newgen.indexOf(sub);
                        // });
                        setGenPermissions(newgen);
                    }}
                >Delete 2nd Option</Button> */}
                </Col>
                </Row>
                </Col>
            </Form.Group>
            </Card>
            </Container>
            {
                subentries.map((subentry)=>{
                    return(
                        <Container className="bg-white p-3 mb-3" key={subentry.index}>
                            <Form 
                            >
                            <Row>
                            <Col xs={4}>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                    <Form.Label>Subentry {subentry.index} Title</Form.Label>
                                    <Form.Control type="text" 
                                        value={subentry.subtitle}
                                        onChange={(e)=>{
                                            let newSubentries = cloneDeep(subentries);
                                            newSubentries[subentry.index].subtitle = e.target.value;
                                            setSubentries(newSubentries);
                                        }}
                                        placeholder="Enter Subentry Title here" />
                                </Form.Group>
                            </Col>
                            <Col>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                <Form.Label>Subentry {subentry.index} Content</Form.Label>
                                <Form.Control as="textarea" 
                                    value={subentry.content}
                                    onChange={(e)=>{
                                        let newSubentries = cloneDeep(subentries);
                                        newSubentries[subentry.index].content = e.target.value;
                                        setSubentries(newSubentries);
                                    }}
                                    rows={3} 
                                    placeholder="Enter Subentry Content here"/>
                            </Form.Group>
                            </Col>
                            </Row>
                            <hr />




                            <Row>
                            <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
                                <Form.Label column xs={3} md={2}>
                                Specific Permissions
                                </Form.Label>
                                <Col xs={8} md={10}>
                                {
                                    subentry.specificPermissions.map((specificPerm)=>{
                                        return(
                                            <div key={subentry.index+"specific"+specificPerm.index}>
                                            <Row>
                                            <Col>
                                            <Form.Select
                                            className="mb-2"
                                            value={specificPerm.value}
                                            onChange={(e)=>{
                                                let newval = e.target.value;
                                                if ([PUBLIC_OPTION, PRIVATE_OPTION].includes(newval)) {
                                                    let newSubentries = cloneDeep(subentries);
                                                    newSubentries[subentry.index].specificPermissions = [
                                                        {
                                                            index: 0,
                                                            value: newval
                                                        }
                                                    ];
                                                    setSubentries(newSubentries);
                                                } else {
                                                    // let newgen = cloneDeep(genPermissions);
                                                    // newgen[specificPerm.index].value = newval;
                                                    // setGenPermissions(newgen);
                                                    let newSubentries = cloneDeep(subentries);
                                                    newSubentries[subentry.index].specificPermissions[specificPerm.index] = {
                                                            index: specificPerm.index,
                                                            value: newval
                                                        };
                                                    setSubentries(newSubentries);
                                                }
                                            }}
                                            aria-label="Specific permission select" 
                                            disabled={genPermValues[0] == PRIVATE_OPTION}
                                            >

                                            
                                            {
                                                specificPerm.index != 0 ? 
                                                <option value={CHOOSE_OPTION}>Choose Permission</option> : null
                                            }

                                            <option value={PUBLIC_OPTION}>Public</option>
                                            <option value={ORG_OPTION}>Organization</option>
                                            <option value={PERSONS_OPTION}>Specific Persons</option>
                                            <option value={PRIVATE_OPTION}>Private</option>
                                            
                                            {/* {
                                                [ORG_OPTION, PERSONS_OPTION, CHOOSE_OPTION].includes(specificPerm.value) ? null :
                                                <option value={PUBLIC_OPTION}>Public</option>
                                            }
                                            {
                                                [PERSONS_OPTION].includes(specificPerm.value) ? null :
                                                <option value={ORG_OPTION}>Organization</option>
                                            }
                                            {
                                                [ORG_OPTION].includes(specificPerm.value) ? null :
                                                <option value={PERSONS_OPTION}>Specific Persons</option>
                                            }
                                            
                                            <option value={PRIVATE_OPTION}>Private</option> */}
                                               
                                             
                                            
                                            </Form.Select>
                                            </Col>
                                            <Col xs={1} md={2}>
                                            </Col>
                                            </Row>
                                            <Row>
                                            {/* <Col xs={1} md={1}>
                                            </Col> */}
                                            <Col>
                                            {
                                                [ORG_OPTION, PERSONS_OPTION].includes(specificPerm.value) ? 
                                                <>
                                                <Form.Control type="text" 
                                                data-bs-theme="dark"
                                                className="mb-2"
                                                placeholder={
                                                    specificPerm.value == ORG_OPTION ? "Ex. @up.edu.ph,@gbox.adnu.edu.ph [Separate by commas]"
                                                    : "Ex. johndoe@gmail.com,janedoe@gmail.com [Separate by commas]"
                                                } 
                                                value={specificPerm.details ?? ""}
                                                onChange={(e)=>{
                                                    let newval = e.target.value;
                                                    let newSubentries = cloneDeep(subentries);
                                                    newSubentries[subentry.index].specificPermissions[specificPerm.index].details = newval;
                                                    setSubentries(newSubentries);
                                                }}
                                                />
                                                </>
                                                : null
                                            }
                                            </Col>
                                            <Col xs={4} md={2}>
                                            </Col>
                                            </Row>
                                            </div>
                                        );
                                    })
                                }
                                <Row>
                                <Col md={6}>
                                {
                                    genPermValues[0] == PUBLIC_OPTION ? 
                                        <Button className="mb-1" 
                                        variant={
                                            subentry.specificPermissions.length >= 2 ? "danger" : "warning"
                                        } 
                                        disabled={
                                            subentry.specificPermissions.map((sp)=>{
                                                return sp.value
                                            })
                                            .includes(PUBLIC_OPTION)
                                            ||
                                            subentry.specificPermissions.map((sp)=>{
                                                return sp.value
                                            })
                                            .includes(PRIVATE_OPTION)
                                        }
                                        onClick={()=>{
                                            if (subentry.specificPermissions.length >= 2) {
                                                let newSubentries = cloneDeep(subentries);
                                                newSubentries[subentry.index].specificPermissions.splice(1, 1);
                                                // newSubentries.map((sub)=>{
                                                //     sub.index = newSubentries.indexOf(sub);
                                                // });
                                                setSubentries(newSubentries);
                                            }
                                            else {
                                                let newSubentries = cloneDeep(subentries);
                                                newSubentries[subentry.index].specificPermissions.push({
                                                    index: newSubentries[subentry.index].specificPermissions.length,
                                                    value: CHOOSE_OPTION
                                                });

                                                setSubentries(newSubentries);
                                            }
                                        }
                                    }>{
                                        subentry.specificPermissions.length >= 2 ? "Delete" : "Add"
                                    } 2nd Option</Button>
                                    : null
                                }
                                {/* <Button className="mb-1" variant="danger"
                                    disabled={genPermissions.length <= 1}
                                    onClick={()=>{
                                        let newgen = cloneDeep(genPermissions);
                                        newgen.splice(1, 1);
                                        // newgen.map((sub)=>{
                                        //     sub.index = newgen.indexOf(sub);
                                        // });
                                        setGenPermissions(newgen);
                                    }}
                                >Delete 2nd Option</Button> */}
                                </Col>
                                </Row>
                                </Col>
                            </Form.Group>
                            </Row>




                            <hr />
                            <Row>
                                <Col>
                                {/* <Col></Col> */}
                                {/* <Col xs={1}> */}
                                <Button variant="danger" onClick={()=>{
                                    let newSubentries = cloneDeep(subentries);
                                    newSubentries.splice(subentry.index, 1);
                                    newSubentries.map((sub)=>{
                                        sub.index = newSubentries.indexOf(sub);
                                    });
                                    setSubentries(newSubentries);
                                }}>Delete</Button>
                                {/* </Col> */}
                                </Col>
                            </Row>
                            </Form>
                        </Container>
                    );
                })
            }
            <Container>
            <Row>
                <Col>
                <Button className="mb-3" variant="light" onClick={()=>{
                    let newSubentries = cloneDeep(subentries);
                    newSubentries.push({
                        index: subentries.length,
                        subtitle: "",
                        type: "text",
                        content: "",
                        specificPermissions: genPermissions
                    });

                    setSubentries(newSubentries);
                }}>Add Subentry</Button>
                <span>  </span>
                <Button className="mb-3" variant="light" onClick={()=>{
                    postCreateEntry();
                }}>Create and Publish</Button>
                </Col>
            </Row>
            </Container>
        </div>
    );
};

export default CreateEntry;