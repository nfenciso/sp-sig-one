import React, { useEffect, useReducer, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as PDFJS from 'pdfjs-dist';
import html2canvas from 'html2canvas';

import NavigationBar from "./components/NavigationBar";
import ImageSlider from "./components/ImageSlider";

import { baseURL, selfURL } from "../utils/constants";
import { postFetch } from "../utils/requests";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import { clone, cloneDeep, isNull, set } from "lodash";

import QRCode from "qrcode";

// Reference: https://stackoverflow.com/questions/61921515/i-have-an-error-with-pdf-js-with-the-global-worker-and-the-async
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');

const PDFPage = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("user") ? true : null);
	const [filename, setFilename] = useState(null);
    const [displayButtons, setDisplayButtons] = useState(false);
    const [imgIdx, setImgIdx] = useState(0);
    const imgIdxRef = useRef(0);
    const [qrImage, setQrImage] = useState(null);
    const [arrImg, setArrImg] = useState(null);
    const [imgDim, setImgDim] = useState(null);
    const imgDimRef = useRef(null);
    const arrImgRef = useRef(null);
    const [canvasList, setCanvasList] = useState(null);
    const canvasListRef = useRef(null);
    const drawImgConfig = useRef(null);
    const pdfBytesRef = useRef(null);
    const [hasPicked, setHasPicked] = useState(false);

    const [entries, setEntries] = useState(null);

    const fetchAllEntries = async () => {
        await postFetch(`${baseURL}/get-personal-entries`, {
            email: JSON.parse(localStorage.getItem("user")).email
        }).then((res)=>{
            if (res?.results) {
                setEntries(res.results);
            } else {
                setEntries([]);
            }
        });
    };

    useEffect(()=>{
        PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;
        let userString = localStorage.getItem("user");

        if (userString) {
            setIsLoggedIn(true);

            if (location.state?.id) {
                QRCode.toDataURL(location.state.id, { errorCorrectionLevel: 'H' }, function (err, url) {
                    setQrImage(url);
                });
            }
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    useEffect(()=>{
        if (isLoggedIn) {
            fetchAllEntries();
        }
    }, [isLoggedIn]);

    useEffect(()=>{
        if (qrImage) {
            async function getImgDim() {
                const img = new Image();
                img.src = qrImage;
                await img.decode();
                setImgDim(img.width * 0.5);
                imgDimRef.current = img.width * 0.5;
            };

            getImgDim();
        }
    }, [qrImage]);

    const reset = () => {
        setImgIdx(0);
        imgIdxRef.current = 0;
        setQrImage(null);
        setArrImg(null);
        setImgDim(null);
        imgDimRef.current = null;
        arrImgRef.current = null;
        setCanvasList(null);
        canvasListRef.current = null;
        drawImgConfig.current = null;
        pdfBytesRef.current = null;
        setHasPicked(false);
    }

    /**
	 * Handles downloading of file.
	 */
	const downloadFile = (filename, data) => {
		const blob = new Blob([data]);
		const elem = window.document.createElement('a');
		elem.href = window.URL.createObjectURL(blob);
		elem.download = filename;      
		elem.style.display = 'none';  
		document.body.appendChild(elem);
		elem.click();        
		document.body.removeChild(elem);
		window.URL.revokeObjectURL(elem.href);
	};

    const loadPdfToImage = async (file) => {
    
        const selectedFile = file;
        var existingPdfBytes;

        setFilename(file.name);
		
		const reader = new FileReader();
		reader.onload = async function() {
            existingPdfBytes = reader.result;
            pdfBytesRef.current = cloneDeep(reader.result);

            // Reference: https://gist.github.com/ichord/9808444

            PDFJS.getDocument(reader.result).promise.then((pdf) => {
                var imgArr = [0*pdf.numPages];
                var canvasArr = [0*pdf.numPages];
                for (let i = 1; i<=pdf.numPages; i++) {
                    pdf.getPage(i).then((page) => {
                        var viewport = page.getViewport({scale: 1});
            
                        //
                        // Prepare canvas using PDF page dimensions
                        //
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext("2d");
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        //document.getElementById("canvasContainer").appendChild(canvas);
                        canvas.onmousedown = getCoordinates;
            
                        //
                        // Render PDF page into canvas context
                        //
                        page.render({canvasContext: context, viewport: viewport})
                        .promise.then(() => {
                            // setImgUrl(canvas.toDataURL());
                            imgArr[i-1] = canvas.toDataURL();
                            canvasArr[i-1] = canvas;
                        });
                    });
                }

                setTimeout(()=>{
                    setArrImg(imgArr);
                    arrImgRef.current = cloneDeep(imgArr);
                    setCanvasList(canvasArr);
                    canvasListRef.current = cloneDeep(canvasArr);
                    //console.log(canvasListRef.current);

                    setImgIdx(0);
                    imgIdxRef.current = 0;
                }, 1000);
                
              }, (error) => {
                console.log(error);
              });

              
		};
		reader.readAsArrayBuffer(selectedFile);

    }

    const downloadPdf = async () => {
        // Reference: https://github.com/Hopding/pdf-lib
            
        const pdfDoc = await PDFDocument.load(pdfBytesRef.current);

        const pngImageBytes = await fetch(qrImage).then((res) => res.arrayBuffer());

        // Embed the PNG image bytes
        const pngImage = await pdfDoc.embedPng(pngImageBytes);
        const pngDims = pngImage.scale(1);

        // // Embed the Helvetica font
        // const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

        // Get the page of the document
        const pages = pdfDoc.getPages();
        const pageToAddQr = pages[imgIdxRef.current];

        // Get the width and height of the first page
        const { width, height } = pageToAddQr.getSize();
        //console.log(width, height);

        pageToAddQr.drawImage(pngImage, {
            x: drawImgConfig.current.x, //firstPage.getWidth() / 2 - pngDims.width / 2 + 75,
            y: height - drawImgConfig.current.yPart, //firstPage.getHeight() / 2 - pngDims.height,
            width: drawImgConfig.current.width,
            height: drawImgConfig.current.height,
          });

        // // Draw a string of text diagonally across the first page
        // firstPage.drawText('This text was added with JavaScript!', {
        //   x: 5,
        //   y: height / 2 + 300,
        //   size: 50,
        //   font: helveticaFont,
        //   color: rgb(0.95, 0.1, 0.1),
        //   rotate: degrees(-45),
        // })

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save()

        // Trigger the browser to download the PDF document
        downloadFile( filename.slice(0,-4) +"_marked.pdf", pdfBytes);

        // const c = document.getElementById("canvas").children[0];
        // const ctx = c.getContext("2d");

        // let img = new Image();
        // img.src = arrImgRef.current[imgIdxRef.current];
        // ctx.drawImage(img,0,0);
    }

    // Reference: https://www.chestysoft.com/imagefile/javascript/get-coordinates.asp
    function findPosition(oElement) {
        if(typeof( oElement.offsetParent ) != "undefined") {
            for(var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent)
            {
            posX += oElement.offsetLeft;
            posY += oElement.offsetTop;
            }
            return [ posX, posY ];
        }
        else {
            return [ oElement.x, oElement.y ];
        }
    }

    const prevPos = useRef(null);

    const getCoordinates = (e) => {
        var posX = 0;
        var posY = 0;
        var imgPos;
        imgPos = findPosition(document.getElementById("canvas").children[0]);
        const imgContainer = document.getElementById("imgContainer");
        // if (!e) var e = window.event;
        
        posX = e.clientX + document.body.scrollLeft + imgContainer.scrollLeft;
        posY = e.pageY;//e.clientY + document.body.scrollTop + imgContainer.scrollTop;
        
        posX = posX - imgPos[0];
        posY = posY - imgPos[1];
        
        //console.log(posX, posY);
        // console.log("===");

        //console.log(prevPos.current);
        if (posX < 0 || posY < 0) {
            posX = prevPos.current.posX;
            posY = prevPos.current.posY;
        } else {
            prevPos.current = {
                posX: posX,
                posY: posY
            }
        }

        const c = document.getElementById("canvas").children[0];
        const ctx = c.getContext("2d");

        let img = new Image();
        img.src = arrImgRef.current[imgIdxRef.current];
        ctx.drawImage(img,0,0);

        drawImgConfig.current = {
            x: posX,
            yPart: posY,
            width: imgDimRef.current,
            height: imgDimRef.current
        }

        // Red rectangle
        // ctx.beginPath();
        // ctx.lineWidth = "1";
        // ctx.strokeStyle = "red";
        // ctx.rect(posX, posY, imgDimRef.current, -imgDimRef.current); 
        // ctx.stroke();

        ctx.fillStyle = 'rgba(225,0,0,0.5)';
        ctx.fillRect(posX, posY, imgDimRef.current, -imgDimRef.current);  

        setHasPicked(true);
    }

    return(
        <>
            <NavigationBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Container className="mb-5" id="pdfcontainer">
            {
                isNull(isLoggedIn) ?
                null :
                <>
                <Row className="bg-white mx-auto px-3 pt-3 pb-0" >
                <Col xs={10} lg={3}>
                <div>
                <input type="file" accept=".pdf" onChange={(e) => {
                    if (e.target.files[0]) {
                        loadPdfToImage(e.target.files[0]);
                    }
                }} />
                
                </div>
                
                </Col>
                <Col>
                {
                    entries ?
                    entries.length == 0 ?
                    <p><b>Create an Entry first.</b></p>
                    :
                    <select style={{width: "10em"}} id="qrselect"
                        onChange={(e)=>{
                            QRCode.toDataURL(`${selfURL}/view-entry/${e.target.value}`, { errorCorrectionLevel: 'H' }, function (err, url) {
                                //setQrImage(url);
                                var img = new Image();
                                img.onload = function() {      
                                    img.style.position = "absolute";
                                    img.style.top = "0";
                                    img.style.left = "0";
                                    img.style.zIndex = "-999";
                                    document.getElementById("pdfcontainer").appendChild(img);
                                    img.style.border = "1px outset rgba(0,0,0,0.8)";
                                    
                                    html2canvas(img).then((canvas)=>{
                                        setQrImage(canvas.toDataURL());
                                    });
                                };
                                
                                img.src = url;
                            });
                        }}
                        defaultValue={location.state?.id? location.state?.id : "0"}
                    >
                        <option disabled value="0" style={{display:"none"}}> -select an option- </option>
                        {
                            entries.map((entry)=>{
                                return(
                                    <option value={entry._id} key={entry._id}>{entry.entryTitle} - {entry.dateGenerated}</option>
                                );
                            })
                        }
                    </select> :
                    <p><b>Fetching entries...</b></p>
                }
                </Col>
                </Row>
                <Row  className="mb-3 bg-white mx-auto px-3 pt-1 pb-3" >
                    <Col>
                    <div>
                    <button 
                        disabled={!hasPicked || !qrImage}
                        onClick={()=>{
                            downloadPdf();
                        }}
                    >Download modified PDF</button>
                    </div>
                    </Col>
                </Row>
                {
                    qrImage && canvasList ?
                    <Row id="imgContainer" className="bg-white mx-auto" style={{overflow: "auto"}}>
                    <ImageSlider 
                        arrImg={arrImg}
                        getCoordinates={getCoordinates} 
                        imgIdx={imgIdx}
                        setImgIdx={setImgIdx}
                        imgIdxRef={imgIdxRef}
                        canvasList={canvasList}
                        arrImgRef={arrImgRef}
                        hasPicked={hasPicked}
                        setHasPicked={setHasPicked}
                        setImgDim={setImgDim}
                        imgDimRef={imgDimRef}
                        drawImgConfig={drawImgConfig}
                        displayButtons={displayButtons}
                        setDisplayButtons={setDisplayButtons}
                    />
                    </Row>
                    :
                    null
                }
                </>
            }
            
            {
                displayButtons?
                <div style={{position: "fixed", bottom: "20px", right: "20px", display: "flex", gap: "12px"}}>
                    <div  style={{display: "flex", gap: "2px"}}>
                        <button style={{borderRadius: "40px", width: "40px", height: "40px"}}
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
                        }}>{"<"}</button>
                        <button style={{borderRadius: "40px", width: "40px", height: "40px"}}
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
                        }}>{">"}</button>
                    </div>
                    <div  style={{display: "flex", gap: "2px"}}>
                        <button style={{borderRadius: "40px", width: "40px", height: "40px"}}
                            disabled={!hasPicked}
                            onClick={()=>{
                            setImgDim((prev)=>{return prev-10});
                            imgDimRef.current -= 10;

                            var clickEvent = new MouseEvent("mousedown");
                            document.getElementById("canvas").children[0].dispatchEvent(clickEvent);
                        }}>--</button>
                        <button style={{borderRadius: "40px", width: "40px", height: "40px"}}
                            disabled={!hasPicked}
                            onClick={()=>{
                            setImgDim((prev)=>{return prev-2});
                            imgDimRef.current -= 2;

                            var clickEvent = new MouseEvent("mousedown");
                            document.getElementById("canvas").children[0].dispatchEvent(clickEvent);
                        }}>-</button>
                        <button style={{borderRadius: "40px", width: "40px", height: "40px"}}
                            disabled={!hasPicked}
                            onClick={()=>{
                            setImgDim((prev)=>{return prev+2});
                            imgDimRef.current += 2;

                            var clickEvent = new MouseEvent("mousedown");
                            document.getElementById("canvas").children[0].dispatchEvent(clickEvent);

                        }}>+</button>
                        <button style={{borderRadius: "40px", width: "40px", height: "40px", textAlign: "center"}}
                            disabled={!hasPicked}
                            onClick={()=>{
                            setImgDim((prev)=>{return prev+10});
                            imgDimRef.current += 10;

                            var clickEvent = new MouseEvent("mousedown");
                            document.getElementById("canvas").children[0].dispatchEvent(clickEvent);

                        }}>++</button>
                    </div>
                </div>
                :
                null
            }
            </Container>
        </>
    );
};

export default PDFPage;