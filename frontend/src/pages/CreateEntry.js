import React, { useEffect, useState } from "react";
import { useParams, useNavigate, generatePath } from "react-router-dom";

import NavigationBar from "./components/NavigationBar";

import { baseURL } from "../utils/constants";
import { postFetch } from "../utils/requests";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import Creatable, { useCreatable } from 'react-select/creatable';
import Select from 'react-select';
import { clone, cloneDeep, isNull, values } from "lodash";

const CHOOSE_OPTION = "-1";
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

const DEFAULT_SUB = [
    {
        index: 0,
        subtitle: "",
        type: "text",
        content: "",
        specificPermission: S_RETAIN_OPTION,
        specificPermissionDetails: [],
        extra: ""
    }
];
const DEFAULT_GEN = PUBLIC_OPTION;

const CreateEntry = () => {

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("user") ? true : null);
    const [entryTitle, setEntryTitle] = useState("");
    const [subentries, setSubentries] = useState([]);

    const [genPermission, setGenPermission] = useState(DEFAULT_GEN);
    const [genPermissionDetails, setGenPermissionDetails] = useState([]);

    const [orgOptions, setOrgOptions] = useState([]);
    const [personsOptions, setPersonsOptions] = useState([]);

    const [isPublicPrivate, setIsPublicPrivate] = useState(true);

    const postCreateEntry = async () => {
        await postFetch(`${baseURL}/create-entry`, {
            userEmail: JSON.parse(localStorage.getItem("user")).email,
            entryTitle,
            subentriesCount: subentries.length,
            genPermission: genPermission,
            genPermissionDetails: genPermissionDetails,
            subentries
        }).then((res)=>{
            setEntryTitle("");
            setSubentries([]);
            setGenPermission(DEFAULT_GEN);
            setGenPermissionDetails([]);
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
        console.log(subentries);    
    }, [subentries]);

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
                General Permission
                </Form.Label>
                <Col xs={8} md={10}>
                    <div>
                    <Row>
                    <Col>
                    <Form.Select
                        className="mb-2"
                        value={genPermission}
                        onChange={(e)=>{
                            setGenPermission(e.target.value);
                            setGenPermissionDetails([]);

                            let newSubentries = cloneDeep(subentries);

                            newSubentries?.map((sub)=>{
                                sub.specificPermission = S_RETAIN_OPTION;
                                sub.specificPermissionDetails = [];
                                sub.extra = "";
                            });

                            setSubentries(newSubentries);
                        }}
                        aria-label="General permission select" 
                    >
                        <option value={PUBLIC_OPTION}>Public</option>
                        <option value={ORG_OPTION}>Organizations</option>
                        <option value={PERSONS_OPTION}>Specific Persons</option>
                        <option value={PRIVATE_OPTION}>Private</option>
                    </Form.Select>
                    </Col>
                    {/* <Col xs={1} md={2}>
                    </Col> */}
                    </Row>
                    <Row>
                    <Col>
                    {
                        genPermission == ORG_OPTION ? 
                        <Creatable 
                            isMulti
                            options={orgOptions}
                            onCreateOption={(val)=>{
                                setOrgOptions((currOpt)=>{
                                    return([...currOpt, {
                                        value: val,
                                        label: val
                                    }])
                                });

                                setGenPermissionDetails((currOpt)=>{
                                    return([...currOpt, {
                                        value: val,
                                        label: val
                                    }])
                                });

                                let newSubentries = cloneDeep(subentries);

                                newSubentries?.map((sub)=>{
                                    sub.specificPermission = S_RETAIN_OPTION;
                                    sub.specificPermissionDetails = [];
                                    sub.extra = "";
                                });

                                setSubentries(newSubentries);

                            }}
                            value={genPermissionDetails}
                            
                            onChange={(val)=>{
                                setGenPermissionDetails(val);

                                let newSubentries = cloneDeep(subentries);

                                newSubentries?.map((sub)=>{
                                    sub.specificPermission = S_RETAIN_OPTION;
                                    sub.specificPermissionDetails = [];
                                    sub.extra = "";
                                });

                                setSubentries(newSubentries);
                            }}

                            placeholder={"Enter email domain of organization (example: up.edu.ph)"}
                            noOptionsMessage={() => "No options. Type to add new organization."}
                        />
                        :
                        genPermission == PERSONS_OPTION ?
                        <Creatable 
                            isMulti
                            options={personsOptions}
                            onCreateOption={(val)=>{
                                setPersonsOptions((currOpt)=>{
                                    return([...currOpt, {
                                        value: val,
                                        label: val
                                    }])
                                });

                                setGenPermissionDetails((currOpt)=>{
                                    return([...currOpt, {
                                        value: val,
                                        label: val
                                    }])
                                });
                            }}
                            value={genPermissionDetails}
                            
                            onChange={(val)=>{
                                setGenPermissionDetails(val);
                            }}

                            placeholder={"Enter the email addresses of the specific persons"}
                            noOptionsMessage={() => "No options. Type to add new email."}
                        /> 
                        : null
                    }
                    </Col>
                    </Row>
                    </div>
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
                                Specific Permission
                                </Form.Label>
                                <Col xs={8} md={10}>

                                <Form.Select
                                    className="mb-2"
                                    value={subentry.specificPermission}
                                    onChange={(e)=>{
                                        let newval = e.target.value;
                                        let newSubentries = cloneDeep(subentries);

                                        newSubentries[subentry.index].specificPermission = newval;
                                        
                                        if (newval == S_MORE_SPECIFIC_ORG_OPTION || newval == S_MORE_SPECIFIC_PERSONS_OPTION) {
                                            newSubentries[subentry.index].specificPermissionDetails = genPermissionDetails;
                                        } else {
                                            newSubentries[subentry.index].specificPermissionDetails = [];
                                        }

                                        newSubentries[subentry.index].extra = "";
                                        
                                        setSubentries(newSubentries);
                                    }}
                                    aria-label="General permission select" 
                                >
                                    <option value={S_RETAIN_OPTION}>Same as General Permission</option>
                                    {
                                        genPermission == PRIVATE_OPTION?
                                        null
                                        :
                                        <option value={S_PRIVATIZE_OPTION}>Privatize</option>
                                    }
                                    {
                                        [PRIVATE_OPTION, ORG_OPTION].includes(genPermission)?
                                        null
                                        :
                                        <option value={S_NEWTYPE_ORG_OPTION}>Add Another Type of Restriction: Organizations</option>
                                    }
                                    {
                                        [PRIVATE_OPTION, PERSONS_OPTION].includes(genPermission)?
                                        null
                                        :
                                        <option value={S_NEWTYPE_PERSONS_OPTION}>Add Another Type of Restriction: Persons</option>
                                    }
                                    
                                    {
                                        genPermission == ORG_OPTION && genPermissionDetails.length > 1?
                                        <option value={S_MORE_SPECIFIC_ORG_OPTION}>Remove Item from List of Authorized Organizations</option>
                                        :
                                        null
                                    }
                                    {
                                        genPermission == PERSONS_OPTION && genPermissionDetails.length > 1?
                                        <option value={S_MORE_SPECIFIC_PERSONS_OPTION}>Remove Item from List of Authorized Persons</option>
                                        :
                                        null
                                    }
                                </Form.Select>
                                {
                                    subentry.specificPermission == S_NEWTYPE_ORG_OPTION ? 
                                    <Creatable 
                                        isMulti
                                        options={orgOptions}
                                        onCreateOption={(val)=>{
                                            setOrgOptions((currOpt)=>{
                                                return([...currOpt, {
                                                    value: val,
                                                    label: val
                                                }])
                                            });

                                            let newSubentries = cloneDeep(subentries);
                                            newSubentries[subentry.index].specificPermissionDetails.push({
                                                value: val,
                                                label: val
                                            }); 
                                            setSubentries(newSubentries);

                                        }}
                                        value={subentry.specificPermissionDetails}
                                        
                                        onChange={(val)=>{
                                            let newSubentries = cloneDeep(subentries);
                                            newSubentries[subentry.index].specificPermissionDetails = val;
                                            setSubentries(newSubentries);
                                        }}
                                        placeholder={"Enter email domain of organization (example: up.edu.ph)"}
                                        noOptionsMessage={() => "No options. Type to add new organization."}
                                    />
                                    : 
                                    subentry.specificPermission == S_NEWTYPE_PERSONS_OPTION ?
                                    <Creatable 
                                        isMulti
                                        options={personsOptions}
                                        onCreateOption={(val)=>{
                                            setPersonsOptions((currOpt)=>{
                                                return([...currOpt, {
                                                    value: val,
                                                    label: val
                                                }])
                                            });

                                            let newSubentries = cloneDeep(subentries);
                                            newSubentries[subentry.index].specificPermissionDetails.push({
                                                value: val,
                                                label: val
                                            }); 
                                            setSubentries(newSubentries);
                                        }}
                                        value={subentry.specificPermissionDetails}
                                        
                                        onChange={(val)=>{
                                            let newSubentries = cloneDeep(subentries);
                                            newSubentries[subentry.index].specificPermissionDetails = val;
                                            setSubentries(newSubentries);
                                        }}

                                        placeholder={"Enter the email addresses of the specific persons"}
                                        noOptionsMessage={() => "No options. Type to add new email."}
                                    /> 
                                    :
                                    subentry.specificPermission == S_MORE_SPECIFIC_ORG_OPTION?
                                    <Select 
                                        isMulti
                                        options={orgOptions}
                                        value={subentry.specificPermissionDetails}
                                        
                                        onChange={(val)=>{
                                            let newSubentries = cloneDeep(subentries);
                                            newSubentries[subentry.index].specificPermissionDetails = val;
                                            setSubentries(newSubentries);
                                        }}
                                        placeholder={"Select email domain of organization"}
                                        noOptionsMessage={() => "Remove an Item."}
                                    />
                                    :
                                    subentry.specificPermission == S_MORE_SPECIFIC_PERSONS_OPTION?
                                    <Select 
                                        isMulti
                                        options={personsOptions}
                                        value={subentry.specificPermissionDetails}
                                        
                                        onChange={(val)=>{
                                            let newSubentries = cloneDeep(subentries);
                                            newSubentries[subentry.index].specificPermissionDetails = val;
                                            setSubentries(newSubentries);
                                        }}
                                        placeholder={"Select email address"}
                                        noOptionsMessage={() => "Remove an Item."}
                                    />
                                    :
                                    null
                                }
                                </Col>
                            </Form.Group>
                            </Row>




                            <hr />
                            <Row>
                                <Col>
                                <Button variant="danger" onClick={()=>{
                                    let newSubentries = cloneDeep(subentries);
                                    newSubentries.splice(subentry.index, 1);
                                    newSubentries?.map((sub)=>{
                                        sub.index = newSubentries.indexOf(sub);
                                    });
                                    setSubentries(newSubentries);
                                }}>Delete</Button>
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
                        specificPermission: S_RETAIN_OPTION,
                        specificPermissionDetails: [],
                        extra: ""
                    });

                    setSubentries(newSubentries);
                }}>Add Subentry</Button>
                <span>  </span>
                <Button className="mb-3" variant="light" onClick={()=>{
                    if (window.confirm("Confirm create entry?") == true) {
                        postCreateEntry();
                    }
                }}>Create and Publish</Button>
                </Col>
            </Row>
            </Container>
        </div>
    );
};

export default CreateEntry;