import React, { useEffect, useReducer, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as PDFJS from 'pdfjs-dist';
//import * as PNG from 'pngjs';
import jsQR from "jsqr";

import { AiOutlineLoading3Quarters } from "react-icons/ai";

import NavigationBar from "./components/NavigationBar";

import { baseURL } from "../utils/constants";
import { postFetch } from "../utils/requests";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import { clone, cloneDeep, isNull } from "lodash";

import QRCode from "qrcode";

// Reference: https://stackoverflow.com/questions/61921515/i-have-an-error-with-pdf-js-with-the-global-worker-and-the-async
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');

var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

const ScannerPDFPage = () => {

    const navigate = useNavigate();

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
    const [rendering, setRendering] = useState(false);
    const [doneRender, setDoneRender] = useState(false);
    const [scannedResults, setScannedResults] = useState([]);

    useEffect(()=>{
        PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;
        let userString = localStorage.getItem("user");

        if (userString) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    useEffect(()=>{
        if (isLoggedIn) {
            
        }
    }, [isLoggedIn]);

    useEffect(()=>{
        if (qrImage) {
            async function getImgDim() {
                const img = new Image();
                img.src = qrImage;
                await img.decode();
                setImgDim(img.width);
                imgDimRef.current = img.width;
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
                var numScannedPages = 0;
                var progress = document.getElementById('scanProgress');
                var newResults = []

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
                        //canvas.onmousedown = getCoordinates;
            
                        //
                        // Render PDF page into canvas context
                        //
                        page.render({canvasContext: context, viewport: viewport})
                        .promise.then(async () => {
                            // setImgUrl(canvas.toDataURL());
                            imgArr[i-1] = canvas.toDataURL();
                            canvasArr[i-1] = canvas;

                            // References: 
                            //  https://sivarampg.medium.com/reading-qr-codes-in-pdf-files-using-javascript-3b26f9c514a0
                            //  https://stackoverflow.com/questions/51948472/image-base64-string-to-uint8clampedarray

                            let ctx = canvas.getContext("2d");
                            let imageData = ctx.getImageData(0, 0, viewport.width, viewport.height); 

                            var code;
                            try {
                                code = jsQR(Uint8ClampedArray.from(imageData.data), viewport.width, viewport.height);
                            } catch (error) {
                                console.log(error);
                            }
                            const qrCodeText = code?.data;

                            //console.log('QR Code Text: ', qrCodeText);
                            //console.log(i);
                            

                            // let span = document.createElement('p');
                            // span.display = 'inline-block';
                            // span.textContent = `${numScannedPages}/${pdf.numPages} pages scanned. (Page #${i})`;
                            
                            // progress.appendChild(span);

                            //progress.innerText += `${numScannedPages}/${pdf.numPages} pages scanned. (Page #${i})\n`;
                            // setPdfProgress((prev)=>{
                            //     return [...prev, i];
                            // });

                            if (qrCodeText) {
                                let partResult = qrCodeText.split("/");
                                partResult = partResult[partResult.length - 1];
                                if (partResult.charAt(partResult.length - 1) == "/") {
                                    partResult = partResult.slice(0, -1);
                                }

                                if (checkForHexRegExp.test(partResult)) {
                                    //navigate(`/view-entry/${partResult}`);
                                    // let span = document.createElement('p');
                                    // span.textContent = `Valid QR Code Entry`;
                                    
                                    // progress.appendChild(span);
                                    //progress.innerText += `→ Valid QR Code Entry\n`;
                                    newResults.push({
                                        page: i,
                                        isValid: true,
                                        content: partResult
                                    });
                                } else {
                                    newResults.push({
                                        page: i,
                                        isValid: false,
                                        content: qrCodeText
                                    });
                                }
                            }

                            numScannedPages+=1;
                            //console.log(i);

                            if (numScannedPages == pdf.numPages) {
                                setScannedResults(newResults);
                                setDoneRender(true);
                                setRendering(false);
                            }
                        });
                    });
                    
                }
                
              }, (error) => {
                console.log(error);
              });

              
		};
        setDoneRender(false);
        setRendering(true);
        
		reader.readAsArrayBuffer(selectedFile);

    }

    return(
        <>
            <NavigationBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Container>
            <Card className="mb-5 p-4" style={{
                // marginLeft: "5em",
                // marginRight: "5em",
                fontSize: "1.2em"
            }}>
            {
                // isNull(isLoggedIn) ?
                // null :
                <>
                {/* <Row className="mb-3 bg-white mx-auto pt-3" >
                <Col> */}
                {/* <p>Upload PDF file containing the appropriate QR Code.</p>
                <p><input type="file" accept=".pdf" onChange={(e) => {
                    if (e.target.files[0]) {
                        loadPdfToImage(e.target.files[0]);
                    }
                }} />
                </p> */}
                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Upload PDF file containing the appropriate QR Code.</Form.Label>
                    <Form.Control type="file" accept=".pdf" onChange={(e)=>{
                        if (e.target.files[0]) {
                            loadPdfToImage(e.target.files[0]);
                        }
                    }} />
                </Form.Group>
                {
                    rendering?
                    <div style={{fontSize: "0.85em"}}>Processing PDF... For large files, page may freeze until done processing...</div>
                    :
                    null
                }
                
                <div id="scanProgress" style={{maxHeight: "60vh", overflow: "auto", fontSize: "0.85em"}}>
                {
                    doneRender?
                    scannedResults.length != 0?
                    scannedResults?.map((item)=>{
                        if (item.isValid) {
                            return <div key={"result-"+item.page}>Page {item.page}: <a href={"/view-entry/"+item.content}>Valid QR Code Entry</a>
                            </div>
                        } else {
                            return <div key={"result-"+item.page}>Page {item.page}: {item.content}</div>
                        }
                    })
                    :
                    <div>No QR Code found.</div>
                    :
                    null
                }
                </div>
                {/* </Col>
                </Row> */}
                {/* {
                    rendering?
                    <Row><AiOutlineLoading3Quarters className="loading" color="white"  /></Row>
                    :
                    null
                } */}

                {/* <Row className="mb-3 bg-white mx-auto p-3" >
                <Col>
                <div id="scanProgress">
                ---
                </div>
                </Col>
                </Row> */}
                </>
            }
            </Card>
            </Container>
        </>
    );
};

export default ScannerPDFPage;