import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, generatePath } from "react-router-dom";

import NavigationBar from "./components/NavigationBar";

import { baseURL } from "../utils/constants";
import { postFetch } from "../utils/requests";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import Creatable, { useCreatable } from 'react-select/creatable';
import Select from 'react-select';
import { clone, cloneDeep, isNull, values } from "lodash";
import SignatureCanvas from 'react-signature-canvas';
import watermark from 'watermarkjs';
import html2canvas from 'html2canvas';


import { RxText } from "react-icons/rx";
import { FaRegImages } from "react-icons/fa";
import { FaPen } from "react-icons/fa";

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

    const [sending, setSending] = useState(false);

    const [genPermission, setGenPermission] = useState(DEFAULT_GEN);
    const [genPermissionDetails, setGenPermissionDetails] = useState([]);

    const [orgOptions, setOrgOptions] = useState([]);
    const [personsOptions, setPersonsOptions] = useState([]);

    const sigCanvas = useRef([]);

    const postCreateEntry = async () => {
        setSending(true);
        await postFetch(`${baseURL}/create-entry`, {
            userEmail: JSON.parse(localStorage.getItem("user")).email,
            entryTitle,
            subentriesCount: subentries.length,
            genPermission: genPermission,
            genPermissionDetails: genPermissionDetails,
            subentries
        }).then((res)=>{
            console.log(res);

            if (res) {
                alert("Entry created!");
                setSending(false);
                setEntryTitle("");
                setSubentries([]);
                setGenPermission(DEFAULT_GEN);
                setGenPermissionDetails([]);
            } else {
                alert("Failed creating entry")
            }
        });
    };
    
    useEffect(()=>{
        let userString = localStorage.getItem("user");

        if (userString) {
            setIsLoggedIn(true);
        }

    }, []);

    useEffect(()=>{
        //console.log(genPermissionDetails);
        //console.log(subentries);    
    }, [subentries]);

    // Reference: https://stackoverflow.com/questions/1484506/random-color-generator
    const getRandomColor = () => {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

    const addTextWatermark = (width, height, result, index) => {
        let fontSize = (width*72/(96*2.5));

        watermark([result])
        .image(watermark.text.center('SigOne', + fontSize+'px serif', '#000', 0.15))
        .then(function (img) {
            var x1 = function(coffee, metrics, context) {return 0;};
            var y1 = function(coffee, metrics, context) {return 0+fontSize*0.8;};
            watermark([img.src])
            .image(watermark.text.atPos(x1,y1,'SigOne', + fontSize+'px serif', '#000', 0.1)) // upper left
            .then(function (img2) {
                
                var x2 = function(coffee, metrics, context) {return width-(fontSize*3);};
                var y2 = function(coffee, metrics, context) {return height-(fontSize*0.3);};
                watermark([img2.src])
                .image(watermark.text.atPos(x2,y2,'SigOne', + fontSize+'px serif', '#000', 0.2)) // lower right
                .then(function (img3) {
                    let newSubentries = cloneDeep(subentries);
                    newSubentries[index].content = img3.src;
                    setSubentries(newSubentries);
                });
            });
        });
    }

    const applySecurityMeasure = (result, index, shouldAddGradient, shouldAddText) => {
        var newImage = new Image();
        newImage.onload = () => {
            var newDiv;
            document.getElementById("div-img-"+index).appendChild(newImage);
            let width = parseFloat(getComputedStyle(newImage).width);
            let height = parseFloat(getComputedStyle(newImage).height);
            document.getElementById("div-img-"+index).removeChild(newImage);

            if (shouldAddGradient) {
                newDiv = document.createElement("div");
                newDiv.style.height = height+"px";
                newDiv.style.width = width+"px";
                newDiv.height = height+"px";
                newDiv.width = width+"px";
                newDiv.style.background = "yellow";
                newDiv.style.background = `linear-gradient(60deg, ${getRandomColor()}, ${getRandomColor()}, ${getRandomColor()}, ${getRandomColor()}, ${getRandomColor()})`;//blue, red, yellow, green, orange
                newDiv.style.position = "absolute";
                newDiv.style.left = "0";
                newDiv.style.top = "0";
                newDiv.style.zIndex = "-999";
                
                document.getElementById("div-img-"+index).appendChild(newDiv);
            }

            if (shouldAddGradient && !shouldAddText) {
                html2canvas(newDiv).then(function(canvas) {
                    document.getElementById("div-img-"+index).removeChild(newDiv);
                    let gradientImg = canvas.toDataURL();

                    watermark([result, gradientImg])
                    .image(watermark.image.center(0.6))
                    .then(function (img) {
                        let newSubentries = cloneDeep(subentries);
                        newSubentries[index].content = img.src;
                        setSubentries(newSubentries);
                    });
                });
            }
            else if (!shouldAddGradient && shouldAddText) {
                addTextWatermark(width, height, result, index);
            }
            else if (shouldAddGradient && shouldAddText) {
                html2canvas(newDiv).then(function(canvas) {
                    document.getElementById("div-img-"+index).removeChild(newDiv);
                    let gradientImg = canvas.toDataURL();

                    watermark([result, gradientImg])
                    .image(watermark.image.center(0.6))
                    .then(function (img) {
                        addTextWatermark(width, height, img.src, index);
                    });
                });
            }
            

            
        }

        newImage.src = result;
    }

    return(
        <Container style={{backgroundColor: "#204183"}} fluid>
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
                    maxLength={300}
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
                            <Col xs={10} sm={4}>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                    <Form.Label>Subentry {subentry.index} Title</Form.Label>
                                    <Form.Control type="text" 
                                        value={subentry.subtitle}
                                        onChange={(e)=>{
                                            let newSubentries = cloneDeep(subentries);
                                            newSubentries[subentry.index].subtitle = e.target.value;
                                            setSubentries(newSubentries);
                                        }}
                                        placeholder="Enter Subentry Title here" 
                                        maxLength={300}
                                        />
                                </Form.Group>
                                <div style={{display: "flex", gap: "10px"}}>
                                <Button variant={
                                    subentry.type == "text" ?
                                    "secondary" : "outline-secondary"
                                } disabled={subentry.type == "text"}  onClick={()=>{
                                    let newSubentries = cloneDeep(subentries);
                                    newSubentries[subentry.index].type = "text";
                                    newSubentries[subentry.index].content = "";
                                    setSubentries(newSubentries);
                                }}><RxText /></Button>
                                <Button variant={
                                    subentry.type == "image" ?
                                    "secondary" : "outline-secondary"
                                }disabled={subentry.type == "image"} onClick={()=>{
                                    let imgEntryCount = 0;
                                    let imgIdx = [];
                                    subentries.map((sub, index)=>{
                                        if (sub.type == "image" || sub.type == "canvas") {
                                            imgEntryCount+=1;
                                            imgIdx.push(index);
                                        }
                                    });

                                    if (imgIdx.includes(subentry.index)) {
                                        imgEntryCount-=1;
                                    }


                                    if (imgEntryCount < 2) {
                                        let newSubentries = cloneDeep(subentries);
                                        newSubentries[subentry.index].type = "image";
                                        newSubentries[subentry.index].content = "";
                                        setSubentries(newSubentries);
                                    } else {
                                        alert("Each Entry can only have up to 2 Image/Canvas Subentries.");
                                    }
                                }}><FaRegImages /></Button>
                                <Button variant={
                                    subentry.type == "canvas" ?
                                    "secondary" : "outline-secondary"
                                }disabled={subentry.type == "canvas"} onClick={()=>{
                                    let imgEntryCount = 0;
                                    let imgIdx = [];
                                    subentries.map((sub, index)=>{
                                        if (sub.type == "image" || sub.type == "canvas") {
                                            imgEntryCount+=1;
                                            imgIdx.push(index);
                                        }
                                    });

                                    if (imgIdx.includes(subentry.index)) {
                                        imgEntryCount-=1;
                                    }

                                    if (imgEntryCount < 2) {
                                        let newSubentries = cloneDeep(subentries);
                                        newSubentries[subentry.index].type = "canvas";
                                        newSubentries[subentry.index].content = "";
                                        setSubentries(newSubentries);
                                    } else {
                                        alert("Each Entry can only have up to 2 Image/Canvas Subentries.");
                                    }
                                }}><FaPen /></Button>
                                </div>
                            </Col>
                            <Col>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Subentry {subentry.index} Content</Form.Label>
                            {
                                subentry.type == "text" ?
                                <Form.Control as="textarea" 
                                    value={subentry.content}
                                    onChange={(e)=>{
                                        let newSubentries = cloneDeep(subentries);
                                        newSubentries[subentry.index].content = e.target.value;
                                        setSubentries(newSubentries);
                                    }}
                                    rows={3} 
                                    placeholder="Enter Subentry Content here"
                                    maxLength={1000}
                                />
                                :
                                subentry.type == "image" ?
                                <div id={"div-img-"+subentry.index}>
                                    <input 
                                        id={"img-upload-"+subentry.index}
                                        type="file" accept="image/*" 
                                        onClick={()=>{
                                            document.getElementById("img-upload-"+subentry.index).value = null;
                                            let newSubentries = cloneDeep(subentries);
                                            newSubentries[subentry.index].content = "";
                                            setSubentries(newSubentries);
                                        }}
                                        onChange={(e) => {
                                        if (e.target.files[0]) {
                                            if (e.target.files[0].size > 1024*1024) {
                                                alert("Image must not exceed 1MB!");
                                                document.getElementById("img-upload-"+subentry.index).value = null;
                                            }
                                            else {
                                                var reader = new FileReader();
                                    
                                                reader.onload = function(){
                                                    //var output = document.getElementById('output_image');
                                                    //output.src = reader.result;
                                                    // let newSubentries = cloneDeep(subentries);
                                                    // newSubentries[subentry.index].content = reader.result;
                                                    // setSubentries(newSubentries);

                                                    let shouldAddGradient = document.getElementById("checkbox-gradient-"+subentry.index).checked;
                                                    let shouldAddText = document.getElementById("checkbox-text-"+subentry.index).checked;

                                                    if (shouldAddText || shouldAddGradient) {
                                                        applySecurityMeasure(reader.result, subentry.index, shouldAddGradient, shouldAddText);
                                                    } else {
                                                        let newSubentries = cloneDeep(subentries);
                                                        newSubentries[subentry.index].content = reader.result;
                                                        setSubentries(newSubentries);
                                                    }
                                                }
                                                reader.readAsDataURL(e.target.files[0]);
                                            }
                                            
                                        }
                                    }} />
                                    <Container className="mt-2">
                                    <div>Security Measures: (changes will reset past input)</div>
                                    <div>
                                        <Form.Check
                                            id={"checkbox-gradient-"+subentry.index}
                                            type="switch"
                                            label="Apply Gradient"
                                            onChange={()=>{
                                                document.getElementById("img-upload-"+subentry.index).value = null;
                                                let newSubentries = cloneDeep(subentries);
                                                newSubentries[subentry.index].content = "";
                                                setSubentries(newSubentries);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Form.Check
                                            id={"checkbox-text-"+subentry.index}
                                            type="switch"
                                            label="Text Watermark"
                                            onChange={()=>{
                                                document.getElementById("img-upload-"+subentry.index).value = null;
                                                let newSubentries = cloneDeep(subentries);
                                                newSubentries[subentry.index].content = "";
                                                setSubentries(newSubentries);
                                            }}
                                        />
                                    </div>
                                    </Container>
                                    
                                </div>
                                :
                                <>
                                    <div id={"div-img-"+subentry.index}>
                                        <SignatureCanvas
                                            ref={ref => sigCanvas.current[subentry.index] = ref}
                                            canvasProps={{
                                                className: "signatureCanvas",
                                            }}
                                            clearOnResize={false}
                                        />
                                    </div>
                                    <div style={{display: "flex", gap: "5px"}}>
                                        <Button variant="outline-secondary" onClick={()=>{
                                            sigCanvas.current[subentry.index].clear();

                                            let newSubentries = cloneDeep(subentries);
                                            newSubentries[subentry.index].content = "";
                                            setSubentries(newSubentries);
                                        }}>Clear</Button>
                                        <Button variant={subentry.content == "" ? "danger" : "outline-secondary"} onClick={()=>{
                                            let sig = sigCanvas.current[subentry.index].getCanvas().toDataURL("image/png");

                                            let shouldAddGradient = document.getElementById("checkbox-gradient-"+subentry.index).checked;
                                            let shouldAddText = document.getElementById("checkbox-text-"+subentry.index).checked;

                                            if (shouldAddGradient || shouldAddText) {
                                                applySecurityMeasure(sig, subentry.index, shouldAddGradient, shouldAddText);
                                            } else {
                                                let newSubentries = cloneDeep(subentries);
                                                newSubentries[subentry.index].content = sig;
                                                setSubentries(newSubentries);
                                            }

                                        }}
                                            disabled={subentry.content != ""}
                                        >Confirm</Button>
                                        
                                    </div>
                                    <Container className="mt-2">
                                    <div>Security Measures: (changes will reset past input)</div>
                                    <div>
                                        <Form.Check
                                            id={"checkbox-gradient-"+subentry.index}
                                            type="switch"
                                            label="Apply Gradient"
                                            onChange={()=>{
                                                sigCanvas.current[subentry.index].clear();
                                                let newSubentries = cloneDeep(subentries);
                                                newSubentries[subentry.index].content = "";
                                                setSubentries(newSubentries);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Form.Check
                                            id={"checkbox-text-"+subentry.index}
                                            type="switch"
                                            label="Text Watermark"
                                            onChange={()=>{
                                                sigCanvas.current[subentry.index].clear();
                                                let newSubentries = cloneDeep(subentries);
                                                newSubentries[subentry.index].content = "";
                                                setSubentries(newSubentries);
                                            }}
                                        />
                                    </div>
                                    </Container>
                                </>
                            }
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
                                        options={orgOptions.filter(val => genPermissionDetails.includes(val))}
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
                                        options={personsOptions.filter(val => genPermissionDetails.includes(val))}
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
                <Button className="mb-3" variant="light" 
                    disabled={subentries.length>=10}
                    onClick={()=>{
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
                <Button 
                    disabled={sending}
                    className="mb-3" variant="light" onClick={()=>{
                    if (window.confirm("Confirm create entry?") == true) {
                        var invalidInput = false;
                        var reasonNum = 0;

                        if (entryTitle.trim() == "") {
                            invalidInput = true;
                            reasonNum = 1;
                        }
                        if (!invalidInput) {
                            subentries.map((sub)=>{
                                if (!invalidInput) {
                                    if (sub.subtitle.trim() == "") {
                                        invalidInput = true;
                                        reasonNum = 2;
                                    }
                                    else if (sub.content.trim() == "") {
                                        invalidInput = true;
                                        reasonNum = 3;
                                    }
                                }
                            });
                        }
                        if (!invalidInput &&
                            [ORG_OPTION, PERSONS_OPTION].includes(genPermission) && genPermissionDetails.length == 0) {
                            invalidInput = true;
                            reasonNum = 4;
                        }
                        if (!invalidInput) {
                            subentries.map((sub)=>{
                                if (!invalidInput) {
                                    if (
                                        [S_NEWTYPE_ORG_OPTION, S_NEWTYPE_PERSONS_OPTION, S_MORE_SPECIFIC_ORG_OPTION, S_MORE_SPECIFIC_PERSONS_OPTION].includes(sub.specificPermission)
                                        && sub.specificPermissionDetails.length == 0
                                    ) {
                                        invalidInput = true;
                                        reasonNum = 5;
                                    }
                                }
                            });
                        }
                        
                        //alert(`invalidInput: ${invalidInput} | reason: ${reasonNum}`);
                        
                        if (invalidInput) {
                            alert("There is missing information.")
                        } else {
                            postCreateEntry();
                        }
                    }
                }}>Create and Publish</Button>
                </Col>
            </Row>
            </Container>
        </Container>
    );
};

export default CreateEntry;

// const PUBLIC_OPTION = "public";
// const ORG_OPTION = "org";
// const PERSONS_OPTION = "persons";
// const PRIVATE_OPTION = "private";

// const S_RETAIN_OPTION = "retain";
// const S_PRIVATIZE_OPTION = "privatize";
// const S_NEWTYPE_ORG_OPTION = "neworg";
// const S_NEWTYPE_PERSONS_OPTION = "newpersons";
// const S_MORE_SPECIFIC_ORG_OPTION = "morespecificorg";
// const S_MORE_SPECIFIC_PERSONS_OPTION = "morespecificpersons";