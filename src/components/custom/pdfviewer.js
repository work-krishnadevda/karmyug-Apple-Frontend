import React, { useRef, useEffect } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Path to the worker script
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs`;

const PDFViewer = ({ pdfUrl }) => {
    // const canvasRef = useRef(null);
  
    // useEffect(() => {
    //   const renderPDF = async () => {
    //     // Load the PDF
    //     const loadingTask = getDocument(pdfUrl);
    //     const pdf = await loadingTask.promise;
  
    //     // Get the first page
    //     const pageNumber = 1;
    //     const page = await pdf.getPage(pageNumber);
  
    //     // Get the scale for rendering
    //     const scale = 1.5;
    //     const viewport = page.getViewport({ scale });
  
    //     // Set the canvas dimensions
    //     const canvas = canvasRef.current;
    //     const context = canvas.getContext('2d');
    //     canvas.height = viewport.height;
    //     canvas.width = viewport.width;
  
    //     // Render the PDF page into the canvas
    //     const renderContext = {
    //       canvasContext: context,
    //       viewport: viewport
    //     };
    //     page.render(renderContext);
    //   };
  
    //   renderPDF();
    // }, [pdfUrl]);
  
    // return <canvas ref={canvasRef} />;
  };
  
  export default PDFViewer;
  