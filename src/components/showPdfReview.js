import React, { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const ShowPdfReview = ({ pageNumber, numPages, setNumPages, url }) => {
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  useEffect(() => {
    // const url = './bankpdf/adity-birala-new.pdf'
    url && pdfjs.getDocument(url).promise.then(onDocumentLoadSuccess)
  }, [])


  return (
    <>
      <div
      className="show_page_pdf"
      style={{
        width: '100%',
        height: 800,
        border: '1px solid black',
        position: 'relative',
        overflow: 'auto',
        zIndex: '999',
      }}

      
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          {numPages > 0 && (
            <Page
              className="show_pdf"
              pageNumber={pageNumber}
              renderTextLayer={false}
              scale={2}
              renderAnnotationLayer={false}
            />
          )}
        </Document>
      </div>
    </>
  )
}

export default ShowPdfReview
