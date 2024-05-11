import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, NavDropdown, Nav, Navbar, Row, Col, Card } from 'react-bootstrap/'
import { GoogleLogin } from '@react-oauth/google';

import { baseURL } from "../../utils/constants";
import { postFetch } from "../../utils/requests";

import { AiOutlineLoading3Quarters } from "react-icons/ai";

const NavigationBar = ({
    isLoggedIn,
    setIsLoggedIn
}) => {

    const navigate = useNavigate();

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const setWindowSize = () => {
        setWindowWidth(window.innerWidth);
    };
    
    useEffect(()=>{

        window.addEventListener('resize', setWindowSize);

        let userString = localStorage.getItem("user");

        if (userString) {
            setIsLoggedIn(true);
        }

        return () => {
            window.removeEventListener('resize', setWindowSize);
        }
    }, []);

    //style={{ backgroundColor: "#f3f4f6" }} borderBottom: "1px solid black"
    //FFBA5F
    return(
            <Navbar expand="md" fixed="top" 
                style={{
                    backgroundColor: "#FFBA5F",
                    //borderTop: "1px solid black",
                    }} > 
            <Container >
                <Navbar.Brand 
                    style={{
                        fontWeight: "bold", 
                        // textShadow: "1px 1px 1px #fff"
                        // fontFamily: "Helvetica, sans-serif",
                        // fontSize: "1.5em"
                    }}
                    onClick={()=>{
                        navigate("/");
                    }}
                    id="navbarBrand"
                >Sig One</Navbar.Brand>
                <Navbar.Toggle />
                {/* {
                    isLoggedIn ?
                    <Nav><Button variant="outline-primary">Create New Entry</Button></Nav> :
                    null
                } */}
                {
                    isLoggedIn ?
                    <Navbar.Collapse className="justify-content-between">
                        <Nav.Item
                            style={{display: "flex", gap: "12px"}}
                        >
                            <a className="links" onClick={()=>{
                                navigate("/create-entry/");
                            }} >[Create New Entry]</a>
                            <a className="links" onClick={()=>{
                                navigate("/scan-camera");
                            }} >[Scan with Camera]</a>
                            <a className="links" onClick={()=>{
                                navigate("/scan-pdf");
                            }} >[Scan from PDF]</a>
                            <a className="links" onClick={()=>{
                                navigate("/pdf");
                            }} >[Insert to PDF]</a>
                        </Nav.Item>
                        {
                            windowWidth >= 768 ?
                            <Nav>
                                <NavDropdown
                                    title={JSON.parse(localStorage.getItem("user")).name + ` (${JSON.parse(localStorage.getItem("user")).email})`} 
                                    id="topbar-dropdown"
                                    align={"end"}
                                >
                                    <NavDropdown.Item
                                        
                                        onClick={()=>{
                                            localStorage.removeItem("user");
                                            setIsLoggedIn(false);
                                            //navigate("/");
                                            window.location.reload();
                                        }}
                                        
                                    >Logout</NavDropdown.Item>
                                    
                                </NavDropdown>
                            </Nav>
                            :
                            // <Nav.Item>
                            //     Logout
                            // </Nav.Item>
                            <a className="links" onClick={()=>{
                                localStorage.removeItem("user");
                                setIsLoggedIn(false);
                                //navigate("/");
                                window.location.reload();
                            }} >[Logout]</a>
                        }
                    </Navbar.Collapse> 
                    :
                    isLoggingIn?
                    <Navbar.Collapse className="justify-content-end">
                        <Nav>
                            <AiOutlineLoading3Quarters className="loading2" />
                        </Nav>
                    </Navbar.Collapse>
                    :
                    <Navbar.Collapse className="justify-content-end">
                        <Nav>
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    setIsLoggingIn(true);
                                    // console.log(credentialResponse);
                                    // console.log(jwtDecode(credentialResponse.credential));
                                    
                                    await postFetch(`${baseURL}/verify-account`, {
                                        credential: credentialResponse.credential
                                    }).then((user)=>{
                                        if (user?.name) {
                                            const loggedInUser = {
                                                name: user.name,
                                                email: user.email
                                            };

                                            localStorage.setItem("user", JSON.stringify(loggedInUser));

                                            setIsLoggedIn(true);
                                            setIsLoggingIn(false);
                                        }
                                    });
                        
                                }}
                                onError={() => {
                                    console.log('Login Failed');
                                }}
                            />
                        </Nav>
                    </Navbar.Collapse>
                }
            </Container>
            </Navbar>
    )
}

export default NavigationBar;