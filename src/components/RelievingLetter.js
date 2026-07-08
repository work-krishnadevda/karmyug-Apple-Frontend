import React, { useCallback } from 'react'
import { toast } from 'react-toastify'

// Import the headers
import realApplecounseltancyhouseHeader from 'src/assets/images/ndddd.png'
import realAppleAdvisoryHeader from 'src/assets/images/realAppleAdvisoryHeader.png'
import shreeShyamHeader from 'src/assets/images/ShreeShyamHeader.png'
import gauravheader from 'src/assets/images/GauravHeader.png'
import theVocaLearnHeader from 'src/assets/images/TheVocaLearnHeader.png'

// Import the steps images
import realApplecounseltancyhouseSteps from 'src/assets/images/LogoRealapplecunseltancyhouse.png'
import realAppleAdvisorySteps from 'src/assets/images/realappleAdvisory.png'
import shreeShyamSteps from 'src/assets/images/shreeshyam.png'
import gauravSteps from 'src/assets/images/gaurav.png'
import theVocaLearnSteps from 'src/assets/images/thevocalearn.png'

const RelievingLetterGenerator = () => {
  const numberToWords = (num) => {
    if (!num || num === '' || isNaN(num)) return ''

    let number = parseInt(num)
    if (number === 0) return 'Zero'

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const teens = [
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ]
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ]
    const thousands = ['', 'Thousand', 'Lakh', 'Crore']

    const convertHundreds = (n) => {
      let result = ''

      if (n > 99) {
        result += ones[Math.floor(n / 100)] + ' Hundred '
        n %= 100
      }

      if (n > 19) {
        result += tens[Math.floor(n / 10)] + ' '
        n %= 10
      } else if (n > 9) {
        result += teens[n - 10] + ' '
        return result
      }

      if (n > 0) {
        result += ones[n] + ' '
      }

      return result
    }

    if (number < 1000) {
      return convertHundreds(number).trim()
    }

    let result = ''
    let divisor = 1000
    let index = 0

    while (number > 0) {
      const remainder = number % divisor
      if (remainder !== 0) {
        result = convertHundreds(remainder) + thousands[index] + ' ' + result
      }
      number = Math.floor(number / divisor)
      index++
    }

    return result.trim() + ' Rupees Only'
  }
  const getCompanyAssets = (companyName = '') => {
    const name = companyName.toLowerCase()

    if (name.includes('vocalearn')) {
      return { headerLogo: theVocaLearnHeader, Steps: theVocaLearnSteps }
    } else if (name.includes('shree')) {
      return { headerLogo: shreeShyamHeader, Steps: shreeShyamSteps }
    } else if (name.includes('gaurav airan')) {
      return { headerLogo: gauravheader, Steps: gauravSteps }
    } else if (name.includes('real apple advisory')) {
      return { headerLogo: realAppleAdvisoryHeader, Steps: realAppleAdvisorySteps }
    } else {
      return {
        headerLogo: realApplecounseltancyhouseHeader,
        Steps: realApplecounseltancyhouseSteps,
      }
    }
  }
  const generatePrintBasedPDF = useCallback(
    (employeeData, refNumber, currentDate, employeePosition) => {
      const companyName = employeeData.companyName || 'Madhukar Associates'
      const { headerLogo, Steps } = getCompanyAssets(companyName)
      const location = employeeData.location || 'Ratlam'
      const CtcInNumber = employeeData.CtcInNumber || '0/-'
      const RelievingDate = employeeData.relievingDate || new Date().toLocaleDateString('en-IN')
      const dates = employeeData.joiningDate || new Date().toLocaleDateString('en-IN')
      const totalExperience = employeeData.totalExperience || ''
      const letterHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relieving Letter  - ${employeeData.name || 'Employee'} </title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 0; padding: 0; }
          /* 10% extra left/right gap for content */
          .letter-container { max-width: 800px; margin: 0 auto; padding: 20px 10%; box-sizing: border-box; }
          /* header stays visually full-width within padded page */
          .header { text-align: center; margin: 0 -10% 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
          .branches { font-size: 12px; color: #666; background-color: #ffb6c1; padding: 4px 8px; display: inline-block; margin-bottom: 10px; }
          .contact-info { font-size: 10px; color: #333; }
          .letter-details { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
              .recipient { font-size: 14px; margin-bottom: 20px; margin-top: 20px; }

          .subject { text-align: center; font-size: 18px; font-weight: bold; text-decoration: underline; margin: 20px 0;  padding: 8px 16px; }
          .letter-body { font-size: 14px; line-height: 1.8; text-align: justify; margin-bottom: 20px; }
          .highlight { background-color: #ffff99; padding: 2px 4px; font-weight: bold; } 
          .highlight-pink { background-color: #ffb6c1; padding: 2px 4px; font-weight: bold; }
          .signature { margin-top: 40px; }
          .signature-line { border-top: 1px solid #333; margin-top: 30px; width: 300px; }
                   .waterMark {  width: 100px; height: auto;  pointer-events: none;  margin-top:-200px; margin-left:200px; operacity: 0.1;  }

          .print-instructions { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin-bottom: 20px; text-align: center; }
          .generated-footer { text-align: center; font-size: 11px; color: #555; margin-top: 16px; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
            .generated-footer {
              position: fixed;
              left: 0;
              right: 0;
              bottom: 6mm;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
      <div class="letter-container">
          <div class="print-instructions no-print">
            <h3>📄 Welcome Letter Ready for Download</h3>
            <p><strong>Choose your preferred format:</strong></p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin: 20px 0;">
              <button id="printPdfBtn" style="background: #dc3545; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                🖨️ Print / Save as PDF
              </button>
              <button id="downloadWordBtn" style="background: #28a745; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                📄 Download Word Document
              </button>
              <button id="downloadPdfBtn" style="background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                📋 Download HTML File
              </button>
            </div>
            <button onclick="window.close()" style="background: #6c757d; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
               Close Window
            </button>
          </div>

          <div class="header">
    
            <img src=${headerLogo} alt="Madhukar Associates" style="max-width: 100%; margin: 0;" />
          </div>

          <div class="letter-details">
            <div> </div>
            <div><strong>Date:</strong> <span class="highlight">${currentDate}</span></div>
          </div>

          <div class="subject"> TO WHOM SO EVER THIS MAY CONCERN</div>

         <div style="background-color: #FF1493;   width: fit-content;  ">
            <strong>
                <span class = "hightlight" >${companyName}</span><br/>
                MJR-06, Ratnapuri Colony, 80 Feet Road,<br/>
                Ratlam, Madhya Pradesh 457001
            </strong>
            </div>




          <div class="recipient">
            <strong> <span class="highlight name">${
              employeeData.name || 'Employee'
            },</span><br/> <span class="highlight name">${
              employeeData.employeeId || 'Employee'
        }</span>
             </strong>
          </div>


          <div class="letter-body">
            <p>
            We would like to formally acknowledge your contributions your tenure at <span class="highlight">${companyName}</span>. This is certified that <span class="highlight name">${
        employeeData.name || 'Employee'
      },</span>  S/O <span class="highlight name">${
        employeeData.fatherName || 'Employee'
      },</span>    <span class="highlight name">${employeeData.address || 'Employee'},</span>  
            was started working with us as a  <strong><span class="highlight-pink">${employeePosition}</span></strong> at <strong><span class="highlight-pink">${location}</span></strong>  Location.
            </p>
            <p>
                This letter serves as official confirmation that your employment with <span class="highlight">${companyName}</span> from ${dates} to <span class="highlight">${RelievingDate}</span> . We were accepted resignation and wish you all the best in all your future endeavours. <span class="highlight">${totalExperience}</span> worked with us. Last designation was “<strong><span class="highlight-pink">${employeePosition}</span></strong>” and Monthly salary was <span class="highlight">${CtcInNumber}</span>/- rupees (Over time & Conveyance Allowance Excluded). ValuXpert Group would like to express our gratitude for your valuable contributions and wish you success in your future career.
            </p>

          
          </div>

          <div class="signature"> 
            <p><strong>Sincerely,</strong></p>

            <p><strong>Human Resource Department</strong></p>
            <span class="waterM" ><img src=${Steps} alt="Logo" class = "waterMark" /></span>
            <p><strong><span class="highlight-pink">${companyName}</span></strong></p>
            <p><strong><span class="highlight-pink"> A Venture of ValuXpert Group</span></strong></p>

          </div>
          <div class="generated-footer">This Letter is Generated By Computer (Software)</div>
        </div>
      </body>
      </html>
    `

      const printWindow = window.open(
        '',
        '_blank',
        'width=800,height=600,scrollbars=yes,resizable=yes',
      )
      printWindow.document.write(letterHTML)
      printWindow.document.close()

      // Attach download logic inside new window
      printWindow.onload = () => {
        const printPdfBtn = printWindow.document.getElementById('printPdfBtn')
        const wordBtn = printWindow.document.getElementById('downloadWordBtn')
        const pdfBtn = printWindow.document.getElementById('downloadPdfBtn')
        const container = printWindow.document.querySelector('.letter-container')

        const sanitize = (s) =>
          String(s || 'Employee')
            .replace(/\s+/g, '_')
            .replace(/[\\/:"*?<>|]+/g, '') // remove invalid filename chars

        const safeName = sanitize(employeeData.name)
        const safeRef = sanitize(refNumber)

        // Print PDF Button - Opens print dialog
        printPdfBtn.onclick = () => {
          try {
            printWindow.focus()
            printWindow.print()
          } catch (err) {
            alert('Print failed: ' + (err.message || err))
            console.error('Print failed:', err)
          }
        }

        const downloadBlobInDocument = (docContext, blob, filename) => {
          try {
            // Use window.URL instead of docContext.URL
            const url = window.URL.createObjectURL(blob)
            const a = docContext.createElement('a')
            a.href = url
            a.download = filename
            a.style.display = 'none'
            // append required for some browsers
            docContext.body.appendChild(a)
            a.click()
            docContext.body.removeChild(a)
            // revoke after a short delay to ensure the download started
            setTimeout(() => window.URL.revokeObjectURL(url), 1000)
          } catch (error) {
            console.error('Download error:', error)
            // Fallback: try to download in parent window
            try {
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = filename
              a.style.display = 'none'
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              setTimeout(() => window.URL.revokeObjectURL(url), 1000)
            } catch (fallbackError) {
              console.error('Fallback download error:', fallbackError)
              alert('Download failed. Please try right-click and "Save as" on the letter content.')
            }
          }
        }

        wordBtn.onclick = () => {
          try {
            // Remove print instructions and close button from Word document
            const cleanContent = container.innerHTML
              .replace(/<div class="print-instructions[^>]*>.*?<\/div>/gs, '')
              .replace(/<button onclick="window.close\(\)"[^>]*>.*?<\/button>/gs, '')
            const wordHTML =
              "<!DOCTYPE html><html><head><meta charset='utf-8'></head><body>" +
              cleanContent +
              '</body></html>'
            const blob = new Blob([wordHTML], { type: 'application/msword' })
            const filename = `Welcome_Letter_${safeName}_${safeRef}.doc`

            // Try download in popup window first
            downloadBlobInDocument(printWindow.document, blob, filename)
          } catch (err) {
            // Fallback: try downloading from opener (parent) window if available and same-origin
            try {
              if (window.opener && !window.opener.closed) {
                const cleanContent = container.innerHTML
                  .replace(/<div class="print-instructions[^>]*>.*?<\/div>/gs, '')
                  .replace(/<button onclick="window.close\(\)"[^>]*>.*?<\/button>/gs, '')
                const blob = new Blob(
                  [
                    "<!DOCTYPE html><html><head><meta charset='utf-8'></head><body>" +
                      cleanContent +
                      '</body></html>',
                  ],
                  { type: 'application/msword' },
                )
                downloadBlobInDocument(
                  window.opener.document,
                  blob,
                  `Welcome_Letter_${safeName}_${safeRef}.doc`,
                )
              } else {
                throw err
              }
            } catch (finalErr) {
              alert('Download failed: ' + (finalErr.message || finalErr))
              console.error('Download fallback failed:', finalErr)
            }
          }
        }

        // PDF Download Button - Downloads as PDF file
        pdfBtn.onclick = () => {
          try {
            // Create a clean HTML for PDF
            const cleanContent = container.innerHTML
              .replace(/<div class="print-instructions[^>]*>.*?<\/div>/gs, '')
              .replace(/<button onclick="window.close\(\)"[^>]*>.*?<\/button>/gs, '')
            const pdfHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome Letter - ${employeeData.name || 'Employee'}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 0; padding: 20px; }
    .letter-container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px;  }
    .company-name { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
    .branches { font-size: 12px; color: #666; background-color: #ffb6c1; padding: 4px 8px; display: inline-block; margin-bottom: 10px; }
    .contact-info { font-size: 10px; color: #333; }
    .letter-details { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
    .recipient { font-size: 14px; margin-bottom: 20px; margin-top: 20px; }
    .subject { text-align: center; font-size: 18px; font-weight: bold; text-decoration: underline; margin: 20px 0;   padding: 8px 16px;   }
    .letter-body { font-size: 14px; line-height: 1.8; text-align: justify; margin-bottom: 20px; }
    .highlight { background-color: #ffff99; padding: 2px 4px; font-weight: bold; } 
    .highlight-pink { background-color: #ffb6c1; padding: 2px 4px; font-weight: bold; }
    .signature { margin-top: 40px; }
    .signature-line { border-top: 1px solid #333; margin-top: 30px; width: 300px; }
    .waterMark {  width: 100px; height: auto;  pointer-events: none;  margin-top:-200px;   operacity: 0.1;  }
 

  </style>
</head>
<body>
  ${cleanContent}
</body>
</html>`

            const blob = new Blob([pdfHTML], { type: 'text/html' })
            const filename = `Welcome_Letter_${safeName}_${safeRef}.html`
            downloadBlobInDocument(printWindow.document, blob, filename)
          } catch (err) {
            try {
              if (window.opener && !window.opener.closed) {
                const cleanContent = container.innerHTML
                  .replace(/<div class="print-instructions[^>]*>.*?<\/div>/gs, '')
                  .replace(/<button onclick="window.close\(\)"[^>]*>.*?<\/button>/gs, '')
                const pdfHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${cleanContent}</body></html>`
                const blob = new Blob([pdfHTML], { type: 'text/html' })
                downloadBlobInDocument(
                  window.opener.document,
                  blob,
                  `Welcome_Letter_${safeName}_${safeRef}.html`,
                )
              } else {
                throw err
              }
            } catch (finalErr) {
              alert('PDF download failed: ' + (finalErr.message || finalErr))
              console.error('PDF download fallback failed:', finalErr)
            }
          }
        }
      }

      toast.success('Welcome letter opened. Use Ctrl+P to save as PDF or buttons to download.')
    },
    [],
  )

  const generateRelievingLetter = useCallback(
    (employeeData, defaultRoleOptions, relievingDate, branch, currentCtc, currentDesignation) => {
      try {
        const data = employeeData || employeeData?.data || employeeData
        if (!data) throw new Error('Employee data is required')

        // Handle both structures
        const empId =
          data?.employee_id ||
          data?.profile?.employeeId ||
          data?.employment?.employeeId ||
          data?.employment?.employee_id

        if (!empId) throw new Error('Employee ID is required')

        // Auto-populate from backend
        const employeeName =
          data.profile?.name ||
          (data.general?.firstName
            ? data.general?.firstName + ' ' + (data.general?.lastName || '')
            : '') ||
          'Employee'
        const fatherName = data.personal?.fatherName || 'Not specified'
        const employeeId = empId
        const address =
          data.personal?.currentAddress || data.personal?.permanentAddress || 'Address not provided'
        const employeePosition = currentDesignation || 'Employee'

        const companyName = data.employment?.companyName || 'Madhukar Associates'
        const shortCompanyName =
          companyName
            .split(' ')
            .filter(Boolean)
            .map((word) => word[0].toUpperCase())
            .join('') + '’s'

        const location = data.employment?.location || 'Ratlam'
        const joiningDateRaw =
          data.employment?.joiningDate || new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'
        const relievingDateRaw = relievingDate || new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'

        // Parse to Date objects (use local time)
        const jd = new Date(joiningDateRaw + 'T00:00:00')
        const rd = new Date(relievingDateRaw + 'T00:00:00')

        // Defensive: if invalid, fallback to today
        const joiningDateObj = isNaN(jd.getTime()) ? new Date() : jd
        const relievingDateObj = isNaN(rd.getTime()) ? new Date() : rd

        // Calculate years, months, days difference
        let years = relievingDateObj.getFullYear() - joiningDateObj.getFullYear()
        let months = relievingDateObj.getMonth() - joiningDateObj.getMonth()
        let days = relievingDateObj.getDate() - joiningDateObj.getDate()

        if (days < 0) {
          months -= 1
          const prevMonthLastDay = new Date(
            relievingDateObj.getFullYear(),
            relievingDateObj.getMonth(),
            0,
          )
          days += prevMonthLastDay.getDate()
        }
        if (months < 0) {
          years -= 1
          months += 12
        }
        if (years < 0) {
          years = 0
          months = 0
          days = 0
        }

        const yearsStr = String(years).padStart(2, '0')
        const monthsStr = String(months).padStart(2, '0')
        const daysStr = String(days).padStart(2, '0')

        const totalExperience = `${yearsStr} years, ${monthsStr} months and ${daysStr} Days`

        const joiningDateDisplay = joiningDateObj.toLocaleDateString('en-IN')
        const relievingDateDisplay = relievingDateObj.toLocaleDateString('en-IN')

        const CtcInNumber = currentCtc
        const CtcInWords = numberToWords(currentCtc) || 'Twelve Thousand Only'
        const HraInNumber = data.employment?.hraPerMonth
          ? `${data.employment.hraPerMonth}/-`
          : '0/-'
        const HraInWords = data.employment?.hraInWords || 'Four Thousand Only'

        const refNumber = `RAGD${employeeId.replace(/\D/g, '').slice(-4)}${employeePosition
          .replace(/\s+/g, '')
          .slice(0, 2)
          .toUpperCase()}/${Math.floor(Math.random() * 100)}`
        const currentDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        // Prepare simplified object for letter
        const formattedData = {
          name: employeeName,
          fatherName,
          employeeId: employeeId,
          address,
          position: employeePosition,
          companyName,
          shortCompanyName,
          relievingDate: relievingDateDisplay,
          location,
          joiningDate: joiningDateDisplay,
          totalExperience,
          CtcInNumber,
          CtcInWords,
          HraInNumber,
          HraInWords,
        }

        generatePrintBasedPDF(formattedData, refNumber, currentDate, employeePosition)
      } catch (error) {
        console.error('Error generating PDF:', error)
        let errorMessage = 'Error generating PDF. Please try again.'
        if (error.message.includes('Employee data is required')) {
          errorMessage = 'Employee data is missing. Please refresh and try again.'
        } else if (error.message.includes('Employee ID is required')) {
          errorMessage = 'Employee ID is missing. Please check employee data.'
        }
        toast.error(errorMessage)
      }
    },
    [generatePrintBasedPDF],
  )

  return { generateRelievingLetter }
}

// Custom hook for using WelcomeLetterGenerator
export const useRelievingLetterGenerator = () => {
  const generator = RelievingLetterGenerator()
  return generator
}

export default RelievingLetterGenerator
