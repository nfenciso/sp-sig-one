import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button, Container, NavDropdown, Nav, Navbar, Row, Col, Card } from 'react-bootstrap/'
import { GoogleLogin } from '@react-oauth/google';
import sampleQR from '../assets/sampleqr.png';
import { jwtDecode } from "jwt-decode";

const Entrylist = () => {

        const x = [1,2,3,4,5,6,7,8,9,10,11,12]
        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const [user, setUser] = useState();

        return(
            <div style={{ backgroundColor: "#f3f4f6" }}>
                <Navbar style={{ backgroundColor: "white"}} >
                <Container fluid>
                    <Navbar.Brand ><h4 style={{marginLeft: "10px"}}>SIG-ONE</h4></Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                    <Nav>
                        {/* <Nav.Link><div classNaime="g-sgnin2" data-onsuccess="onSignIn"></div></Nav.Link> */}
                        <Nav.Link>
                            {
                                isLoggedIn ? 
                                    <h4>{user}</h4>
                                    :
                                    <GoogleLogin
                                        onSuccess={credentialResponse => {
                                            console.log(credentialResponse);
                                            console.log(
                                                jwtDecode(credentialResponse.credential)
                                            )
                                            setUser(jwtDecode(credentialResponse.credential).name);
                                            setIsLoggedIn(true);
                                        }}
                                        onError={() => {
                                            console.log('Login Failed');
                                        }}
                                    />
                            }
                        </Nav.Link>
                    </Nav>
                    </Navbar.Collapse>
                </Container>
                </Navbar>
                <Container>
                    <Row>
                    {
                        x.map((entry) => {
                            return(
                                // <Row className="mt-3">
                                <Col xs={11} md={4} lg={3} xl={2} className="my-1 mx-auto" key={entry} >
                                <Card >
                                    <Card.Img variant="top" src={sampleQR} />
                                    <Card.Body>
                                        <Card.Title>Entry {entry}</Card.Title>
                                        <Card.Text>
                                        Generated at 1970/01/01
                                        </Card.Text>
                                        <Button variant="primary">View details</Button>
                                    </Card.Body>
                                </Card>
                                </Col>
                                // </Row>
                            )
                        })
                    }
                    </Row>
                </Container>
            </div>
        )
}

export default Entrylist;