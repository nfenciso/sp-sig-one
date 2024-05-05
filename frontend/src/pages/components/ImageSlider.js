import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, NavDropdown, Nav, Navbar, Row, Col, Card } from 'react-bootstrap/'
import { GoogleLogin } from '@react-oauth/google';

import { baseURL } from "../../utils/constants";
import { postFetch } from "../../utils/requests";

const ImageSlider = ({
    arrImg,
    getCoordinates,
    imgIdx, 
    setImgIdx,
    imgIdxRef,
    canvasList,
    arrImgRef,
    hasPicked,
    setHasPicked,
    setImgDim,
    imgDimRef,
    displayButtons,
    setDisplayButtons
}) => {
    
    useEffect(()=>{
        //console.log(canvasList);
        if (canvasList) {
            let canvas = document.getElementById("canvas");
            canvas.innerHTML = "";
            // canvas.removeChild(canvas.lastChild);
            canvas.append(canvasList[imgIdx]);
            const c = document.getElementById("canvas").children[0];
            c.style.border = "1px solid black";
            const ctx = c.getContext("2d");

            let img = new Image();
            img.src = arrImgRef.current[imgIdxRef.current];
            ctx.drawImage(img,0,0);
        }
    }, [canvasList, imgIdx]);

    useEffect(()=>{
        if (canvasList && hasPicked) {
            var clickEvent = new MouseEvent("mousedown");
            document.getElementById("canvas").children[0].dispatchEvent(clickEvent);
        }
    }, [imgIdxRef.current])

    //style={{ backgroundColor: "#f3f4f6" }} borderBottom: "1px solid black"
    //FFBA5F
    return(
        <Container className="py-3 mb-3">
            
            <div className="mb-2">Navigate through the PDF and select a spot to insert the QR Code.</div>
            <div style={{display: "flex", gap: "12px"}}>
                <div>
                <button
                disabled={imgIdx == 0} 
                    onClick={()=>{
                    setImgIdx((prev)=>{
                        if (prev > 0) {
                            imgIdxRef.current = prev-1;
                            return prev-1;
                        } else {
                            imgIdxRef.current = prev;
                            return prev;
                        }
                    })
                    //setHasPicked(false);
                }}>Prev</button>
                <button 
                    disabled={arrImg? imgIdx >= arrImg.length-1: true}
                    onClick={()=>{
                    setImgIdx((prev)=>{
                        if (prev < arrImg.length-1) {
                            imgIdxRef.current = prev+1;
                            return prev+1;
                        } else {
                            imgIdxRef.current = prev;
                            return prev;
                        }
                    })
                    //setHasPicked(false);
                }}>Next</button>
                </div>

                <div>
                <button
                    style={{width: "2.5em"}}
                    disabled={!hasPicked}
                    onClick={()=>{
                    setImgDim((prev)=>{return prev-10});
                    imgDimRef.current -= 10;

                    var clickEvent = new MouseEvent("mousedown");
                    document.getElementById("canvas").children[0].dispatchEvent(clickEvent);
                }}>--</button>
                <button 
                    style={{width: "2.5em"}}
                    disabled={!hasPicked}
                    onClick={()=>{
                    setImgDim((prev)=>{return prev-2});
                    imgDimRef.current -= 2;

                    var clickEvent = new MouseEvent("mousedown");
                    document.getElementById("canvas").children[0].dispatchEvent(clickEvent);
                }}>-</button>
                <button 
                    style={{width: "2.5em"}}
                    disabled={!hasPicked}
                    onClick={()=>{
                    setImgDim((prev)=>{return prev+2});
                    imgDimRef.current += 2;

                    var clickEvent = new MouseEvent("mousedown");
                    document.getElementById("canvas").children[0].dispatchEvent(clickEvent);

                }}>+</button>
                <button
                    style={{width: "2.5em"}}
                    disabled={!hasPicked}
                    onClick={()=>{
                    setImgDim((prev)=>{return prev+10});
                    imgDimRef.current += 10;

                    var clickEvent = new MouseEvent("mousedown");
                    document.getElementById("canvas").children[0].dispatchEvent(clickEvent);

                }}>++</button>
                </div>
                <div>
                    <button
                        onClick={()=>{
                            setDisplayButtons((curr)=>{
                                return !curr;
                            });
                        }}
                    >{displayButtons? "Hide" : "Show"} buttons in the lower right screen</button>
                </div>
            </div>
            {/* <img 
                id="currImg"
                src={arrImg? arrImg[imgIdx] : null} 
                style={{
                    // width: "100%"
                    border: "1px solid black",
                }}
                onMouseDown={(e)=>{
                    getCoordinates(e);
                }}
            /> */}
            <div id="canvas"></div>        
            
        </Container>
    )
}

export default ImageSlider;