import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, NavDropdown, Nav, Navbar, Row, Col, Card } from 'react-bootstrap/'
import { GoogleLogin } from '@react-oauth/google';

import { baseURL } from "../../utils/constants";
import { postFetch } from "../../utils/requests";


const NavigationBar = ({
    isLoggedIn,
    setIsLoggedIn
}) => {

    const navigate = useNavigate();
    
    useEffect(()=>{
        let userString = localStorage.getItem("user");

        if (userString) {
            setIsLoggedIn(true);
        }
    });

    //style={{ backgroundColor: "#f3f4f6" }} borderBottom: "1px solid black"
    return(
        <div>
            <Navbar fixed="top" style={{ backgroundColor: "#FFBA5F",}} >
            <Container fluid>
                <Navbar.Brand style={{fontWeight: "bold"}}
                    onClick={()=>{
                        navigate("/");
                    }}
                    id="navbarBrand"
                >SIG-ONE</Navbar.Brand>
                <Navbar.Toggle />
                {/* {
                    isLoggedIn ?
                    <Nav><Button variant="outline-primary">Create New Entry</Button></Nav> :
                    null
                } */}
                <Navbar.Collapse className="justify-content-end">
                    <Nav>
                        {
                            isLoggedIn ? 
                                <NavDropdown
                                    title={JSON.parse(localStorage.getItem("user")).name} 
                                    id="topbar-dropdown"
                                    align={"end"}
                                >
                                    <NavDropdown.Item
                                        
                                        onClick={()=>{
                                            localStorage.removeItem("user");
                                            setIsLoggedIn(false);
                                            navigate("/");
                                        }}
                                        
                                    >Logout</NavDropdown.Item>
                                    
                                </NavDropdown>
                                :
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
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
                                            }
                                        });
                            
                                    }}
                                    onError={() => {
                                        console.log('Login Failed');
                                    }}
                                />
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
            </Navbar>
        </div>
    )
}

export default NavigationBar;