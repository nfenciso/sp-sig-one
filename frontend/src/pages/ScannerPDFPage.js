import React, { useEffect, useReducer, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as PDFJS from 'pdfjs-dist';
//import * as PNG from 'pngjs';
import jsQR from "jsqr";


import NavigationBar from "./components/NavigationBar";

import { baseURL } from "../utils/constants";
import { postFetch } from "../utils/requests";
import { Container, Row, Col, Card } from "react-bootstrap";
import { clone, cloneDeep, isNull } from "lodash";

import QRCode from "qrcode";

// Reference: https://stackoverflow.com/questions/61921515/i-have-an-error-with-pdf-js-with-the-global-worker-and-the-async
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');

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
                        .promise.then(() => {
                            // setImgUrl(canvas.toDataURL());
                            imgArr[i-1] = canvas.toDataURL();
                            canvasArr[i-1] = canvas;

                            // References: 
                            //  https://sivarampg.medium.com/reading-qr-codes-in-pdf-files-using-javascript-3b26f9c514a0
                            //  https://stackoverflow.com/questions/51948472/image-base64-string-to-uint8clampedarray

                            let ctx = canvas.getContext("2d");
                            let imageData = ctx.getImageData(0, 0, viewport.width, viewport.height); 

                            const code = jsQR(Uint8ClampedArray.from(imageData.data), viewport.width, viewport.height);
                            const qrCodeText = code?.data;

                            console.log('QR Code Text: ', qrCodeText);

                            if (qrCodeText) {
                                navigate(`/view-entry/${qrCodeText}`);
                            }
                        });
                    });
                }
                
              }, (error) => {
                console.log(error);
              });

              
		};
		reader.readAsArrayBuffer(selectedFile);

    }

    return(
        <>
            <NavigationBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Container className="mb-5">
            {
                isNull(isLoggedIn) ?
                null :
                <>
                <Row className="mb-3 bg-white mx-auto p-3" >
                <Col>
                <div>
                <input type="file" accept=".pdf" onChange={(e) => {
                    if (e.target.files[0]) {
                        loadPdfToImage(e.target.files[0]);
                    }
                }} />
                </div>
                <div>
                </div>
                </Col>
                </Row>
                </>
            }
            </Container>
        </>
    );
};

export default ScannerPDFPage;