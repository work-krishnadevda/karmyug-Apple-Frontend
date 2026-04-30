import React, { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`


const PdfPreview = ({ pageNumber, numPages, setNumPages, pdfURL }) => {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const fullPdfURL = pdfURL ? `${process.env.REACT_APP_NODE_URL}/${pdfURL}` : null

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error)
    setError('Failed to load PDF. The file may be missing or corrupted.')
    setLoading(false)
  }

  useEffect(() => {
    if (fullPdfURL) {
      setLoading(true)
      setError(null)
      pdfjs.getDocument(fullPdfURL).promise
        .then(onDocumentLoadSuccess)
        .catch(onDocumentLoadError)
    }
  }, [fullPdfURL])


  if (!fullPdfURL) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No PDF file available
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>
        <p>{error}</p>
        <p style={{ fontSize: '12px', marginTop: '10px' }}>
          URL: {fullPdfURL}
        </p>
      </div>
    )
  }

  return (
    <>
      <div>
        {loading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Loading PDF...
          </div>
        )}
        <Document 
          file={fullPdfURL} 
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Loading PDF...
            </div>
          }
        >
          {numPages > 0 && (
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              scale={1}
              height={841}
              width={595}
              renderAnnotationLayer={false}
            />
          )}
        </Document>
      </div>
    </>
  )
}

export default PdfPreview
