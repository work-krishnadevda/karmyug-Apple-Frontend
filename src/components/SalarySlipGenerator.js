import React, { useCallback } from 'react'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Import the headers
import realApplecounseltancyhouseHeader from 'src/assets/images/ndddd.png'
import realAppleAdvisoryHeader from 'src/assets/images/realAppleAdvisoryHeader.png'
import shreeShyamHeader from 'src/assets/images/ShreeShyamHeader.png'
import gauravheader from 'src/assets/images/GauravHeader.png'
import theVocaLearnHeader from 'src/assets/images/TheVocaLearnHeader.png'

const SalarySlipGenerator = () => {
  const getCompanyAssets = (companyName = '') => {
    const name = companyName.toLowerCase()

    if (name.includes('vocalearn')) {
      return { headerLogo: theVocaLearnHeader }
    } else if (name.includes('shree')) {
      return { headerLogo: shreeShyamHeader }
    } else if (name.includes('gaurav airan')) {
      return { headerLogo: gauravheader }
    } else if (name.includes('real apple advisory')) {
      return { headerLogo: realAppleAdvisoryHeader }
    } else {
      return {
        headerLogo: realApplecounseltancyhouseHeader,
      }
    }
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return '-'
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getMonthName = (monthNumber) => {
    const months = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ]
    return months[monthNumber - 1] || ''
  }

  const generatePrintBasedPDF = useCallback(
    async (employeeData, payrollData, month, year, windowIndex = 0, companyAddress = '', notePurpose = 'both') => {
      const companyName = employeeData.companyName || 'Madhukar Associates'
      const { headerLogo } = getCompanyAssets(companyName)
      const location = employeeData.location || 'Ratlam'
      // Use provided company address or fallback to default
      const address = companyAddress || employeeData.address || 'MJR-06, Ratanpuri, 80Ft Road, Ratlam (M.P)'
      const contactNumber = employeeData.contactNumber || employeeData.phone || ''

      // Employee details
      const employeeName = employeeData.name || 'Employee Name'
      const designation = employeeData.designation || employeeData.position || 'Employee'
      const department = employeeData.department || 'N/A'
      const employeeId = employeeData.employeeId || 'N/A'
      const employeeType = employeeData.employeeType || 'Regular'
      const joiningDate = employeeData.joiningDate || ''

      // Bank details
      const bankName = employeeData.bankName || employeeData.bank?.bankName || 'N/A'
      const accountNumber = employeeData.accountNumber || employeeData.bank?.accountNumber || 'N/A'
      const panNumber = employeeData.panNumber || employeeData.panNo || employeeData.personal?.panNo || employeeData.personal?.pan_no || 'N/A'

      // Salary period
      const monthName = getMonthName(month)
      const salaryPeriod = `(SALARY SLIP OF THE MONTH OF ${monthName}, ${year})`

      // Helper function to safely convert to number
      const toNumber = (value) => {
        if (value === null || value === undefined || value === '') return 0
        const num = typeof value === 'string' ? parseFloat(value) : Number(value)
        return isNaN(num) ? 0 : num
      }

      // Extract salary components from payroll data (Earnings) and convert to numbers
      const basic = toNumber(payrollData?.basic_per_month || payrollData?.revised_basic_per_month || payrollData?.ctc_per_month || 0)
      const hra = toNumber(payrollData?.hra_per_month || 0)
      const mobileAllowance = toNumber(payrollData?.mobile_allowance || payrollData?.mobileAllowance || 0)
      const lta = toNumber(payrollData?.lta || payrollData?.leave_travel_allowance || 0)
      const bonusOvertime = toNumber(payrollData?.overtime_allowance || payrollData?.overtimeAllowance || payrollData?.overtime || payrollData?.bonus || 0)
      const specialAllowance = toNumber(payrollData?.special_allowance || payrollData?.specialAllowance || payrollData?.conveyance_allowance || payrollData?.conveyanceAllowance || 0)

      // Calculate total earnings (proper numeric addition)
      const totalEarnings = basic + hra + mobileAllowance + lta + bonusOvertime + specialAllowance

      // Extract deductions from payroll data and convert to numbers
      const incomeTaxTDS = toNumber(payrollData?.income_tax || payrollData?.tds || payrollData?.tax || 0)
      const providentFund = toNumber(payrollData?.provident_fund || payrollData?.pf || payrollData?.pf_deduction || 0)
      const professionalTax = toNumber(payrollData?.professional_tax || payrollData?.pt || 0)
      const insuranceESI = toNumber(payrollData?.insurance || payrollData?.esi || payrollData?.insurance_esi || 0)
      const advanceTaken = toNumber(payrollData?.advance || payrollData?.advance_taken || 0)
      const otherDeduction = toNumber(payrollData?.other_deduction || payrollData?.otherDeduction || 0)

      // Calculate total deductions (proper numeric addition)
      const totalDeductions = incomeTaxTDS + providentFund + professionalTax + insuranceESI + advanceTaken + otherDeduction

      // Calculate net pay (total earnings - total deductions)
      const netPay = totalEarnings - totalDeductions

      // Convert number to words function
      const numberToWords = (num) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

        if (num === 0) return 'Zero'
        if (num < 10) return ones[num]
        if (num < 20) return teens[num - 10]
        if (num < 100) {
          const ten = Math.floor(num / 10)
          const one = num % 10
          return tens[ten] + (one > 0 ? ' ' + ones[one] : '')
        }
        if (num < 1000) {
          const hundred = Math.floor(num / 100)
          const remainder = num % 100
          return ones[hundred] + ' Hundred' + (remainder > 0 ? ' ' + numberToWords(remainder) : '')
        }
        if (num < 100000) {
          const thousand = Math.floor(num / 1000)
          const remainder = num % 1000
          return numberToWords(thousand) + ' Thousand' + (remainder > 0 ? ' ' + numberToWords(remainder) : '')
        }
        if (num < 10000000) {
          const lakh = Math.floor(num / 100000)
          const remainder = num % 100000
          return numberToWords(lakh) + ' Lakh' + (remainder > 0 ? ' ' + numberToWords(remainder) : '')
        }
        const crore = Math.floor(num / 10000000)
        const remainder = num % 10000000
        return numberToWords(crore) + ' Crore' + (remainder > 0 ? ' ' + numberToWords(remainder) : '')
      }

      const netPayInWords = numberToWords(Math.round(netPay)) + ' Only'

      // Format joining date note
      let joiningNote = ''
      if (joiningDate) {
        try {
          const joinDate = new Date(joiningDate)
          if (!isNaN(joinDate.getTime())) {
            const day = joinDate.getDate()
            const joinMonth = joinDate.toLocaleString('en-US', { month: 'long' })
            const joinYear = joinDate.getFullYear()
            joiningNote = `<span>${employeeName}</span> Joined our team from <span>${day}-${joinMonth}-${joinYear}</span>.`
          }
        } catch (e) {
          console.error('Error formatting joining date:', e)
        }
      }

      const salarySlipHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Slip - ${employeeName} - ${monthName} ${year}</title>
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 0.6cm 0.8cm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Arial', 'Helvetica', sans-serif; 
            line-height: 1.25; 
            color: #000;
            background: #fff;
            padding: 0;
          }
          .salary-slip-container { 
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
          }
          .company-header {
            text-align: center;
            margin-bottom: 8px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #000;
            margin-bottom: 6px;
            letter-spacing: 1px;
          }
          .company-address {
            font-size: 12px;
            color: #333;
          }
          .company-contact {
            font-size: 12px;
            color: #333;
            margin-bottom: 6px;
          }
          .salary-period {
            font-size: 14px;
            font-weight: 600;
            color: #000;
          }
          .venture-text {
            font-size: 12px;
            color: #555;
            margin-bottom: 8px;
          }
          .employee-bank-section {
            display: flex;
            gap: 15px;
            margin-bottom: 10px;
          }
          .employee-details-box, .bank-details-box {
            flex: 1;
            border: 1.5px solid #000;
            padding: 10px;
            background: #fff;
          }
          .box-title {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 6px;
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
          }
          .detail-row {
            display: flex;
            margin-bottom: 6px;
            font-size: 11px;
          }
          .detail-label {
            font-weight: 600;
            min-width: 120px;
            color: #000;
          }
          .detail-value {
            color: #333;
          }
          .earnings-deductions-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            border: 1.5px solid #000;
          }
          .earnings-deductions-table th {
            border: 1.5px solid #000;
            padding: 8px 6px;
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            background-color: #f0f0f0;
          }
          .earnings-deductions-table td {
            border: 1.5px solid #000;
            padding: 6px;
            font-size: 11px;
          }
          .earning-col {
            width: 25%;
            text-align: left;
            padding-left: 10px;
          }
          .amount-col {
            width: 25%;
            text-align: right;
            padding-right: 10px;
            font-weight: 500;
          }
          .deduction-col {
            width: 25%;
            text-align: left;
            padding-left: 10px;
          }
          .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
            font-size: 12px;
          }
          .net-pay-section {
            border: 1.5px solid #000;
            padding: 10px;
            margin-bottom: 10px;
            background: #fff;
          }
          .net-pay-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 12px;
          }
          .net-pay-label {
            font-weight: bold;
          }
          .net-pay-value {
            font-weight: bold;
            font-size: 13px;
          }
          .notes-section {
            border: 1.5px solid #000;
            padding: 10px;
            margin-bottom: 10px;
            font-size: 11px;
          }
          .notes-title {
            font-weight: bold;
            margin-bottom: 6px;
          }
          .note-item {
            margin-bottom: 3px;
            padding-left: 15px;
            position: relative;
          }
          .note-item::before {
            content: "•";
            position: absolute;
            left: 0;
            font-weight: bold;
          }
          .footer-section {
            text-align: center;
            font-size: 10px;
            color: #555;
            margin-top: 10px;
            padding-top: 5px;
            border-top: 1px solid #ddd;
          }
          .footer-line {
            margin-bottom: 3px;
          }
          .print-instructions { 
            background-color: #f8f9fa; 
            border: 1px solid #dee2e6; 
            border-radius: 5px; 
            padding: 15px; 
            margin-bottom: 20px; 
            text-align: center; 
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="salary-slip-container">
          <div class="print-instructions no-print">
            <h3>📄 Salary Slip Ready for Download</h3>
            <p><strong>PDF will be downloaded automatically</strong></p>
          </div>

          <!-- Company Header -->
          <div class="company-header">
            <div class="company-name">${companyName}</div>
            <div class="company-address">${address}</div>
            ${contactNumber ? `<div class="company-contact">Contact Number: 9993889983, 9109138040</div>` : ''}
            <div class="salary-period">${salaryPeriod}</div>
            <div class="venture-text">A Venture of ValuXpert Group</div>
          </div>

          <!-- Employee and Bank Details -->
          <div class="employee-bank-section">
            <div class="employee-details-box">
              <div class="box-title">Employee Details</div>
              <div class="detail-row">
                <span class="detail-label">Name Of Staff:</span>
                <span class="detail-value">${employeeName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Designation:</span>
                <span class="detail-value">${designation}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Department:</span>
                <span class="detail-value">${department}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${location.toUpperCase()}</span>
              </div>
            </div>

            <div class="bank-details-box">
              <div class="box-title">Bank Details</div>
              <div class="detail-row">
                <span class="detail-label">Employee Code:</span>
                <span class="detail-value">${employeeId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Bank Name:</span>
                <span class="detail-value">${bankName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Account No:</span>
                <span class="detail-value">${accountNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">PAN No.:</span>
                <span class="detail-value">${panNumber.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <!-- Earnings and Deductions Table -->
          <table class="earnings-deductions-table">
            <thead>
              <tr>
                <th class="earning-col">Earning</th>
                <th class="amount-col">Amount</th>
                <th class="deduction-col">Deduction</th>
                <th class="amount-col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="earning-col">BASIC:</td>
                <td class="amount-col">${formatCurrency(basic)}</td>
                <td class="deduction-col">Income Tax/TDS:</td>
                <td class="amount-col">${formatCurrency(incomeTaxTDS)}</td>
              </tr>
              <tr>
                <td class="earning-col">HRA:</td>
                <td class="amount-col">${formatCurrency(hra)}</td>
                <td class="deduction-col">Provident Fund:</td>
                <td class="amount-col">${formatCurrency(providentFund)}</td>
              </tr>
              <tr>
                <td class="earning-col">MOBILE ALLOWANCE:</td>
                <td class="amount-col">${formatCurrency(mobileAllowance)}</td>
                <td class="deduction-col">Professional Tax:</td>
                <td class="amount-col">${formatCurrency(professionalTax)}</td>
              </tr>
              <tr>
                <td class="earning-col">LTA:</td>
                <td class="amount-col">${formatCurrency(lta)}</td>
                <td class="deduction-col">Insurance/ESI:</td>
                <td class="amount-col">${formatCurrency(insuranceESI)}</td>
              </tr>
              <tr>
                <td class="earning-col">BONUS /OVERTIME:</td>
                <td class="amount-col">${formatCurrency(bonusOvertime)}</td>
                <td class="deduction-col">Advance Taken:</td>
                <td class="amount-col">${formatCurrency(advanceTaken)}</td>
              </tr>
              <tr>
                <td class="earning-col">SPECIAL ALLOWANCE:</td>
                <td class="amount-col">${formatCurrency(specialAllowance)}</td>
                <td class="deduction-col">Other Deduction:</td>
                <td class="amount-col">${formatCurrency(otherDeduction)}</td>
              </tr>
              <tr class="total-row">
                <td class="earning-col"><strong>Total Earnings -</strong></td>
                <td class="amount-col"><strong>${formatCurrency(totalEarnings)}</strong></td>
                <td class="deduction-col"><strong>Total Deductions -</strong></td>
                <td class="amount-col"><strong>${formatCurrency(totalDeductions)}</strong></td>
              </tr>
            </tbody>
          </table>

          <!-- Net Pay Section -->
          <div class="net-pay-section">
            <div class="net-pay-row">
              <span class="net-pay-label">Net Pay for the month Rupees:</span>
              <span class="net-pay-value">${formatCurrency(netPay)}</span>
            </div>
            <div class="net-pay-row">
              <span class="net-pay-label">In words:</span>
              <span class="net-pay-value">${netPayInWords}</span>
            </div>
          </div>

          <!-- Notes Section -->
          <div class="notes-section">
            <div class="notes-title">Note:</div>
            ${joiningNote ? `<div class="note-item"><span class="highlight-red">${joiningNote}</span></div>` : ''}
            ${notePurpose === 'loan' ? '<div class="note-item">Issued for loan purpose only.</div>' : ''}
            ${notePurpose === 'general' ? '<div class="note-item">Issued for general purpose only.</div>' : ''}
            ${notePurpose === 'both' ? '<div class="note-item">Issued for loan purpose only. Issued for general purpose only.</div>' : ''}
          </div>

          <!-- Footer Section -->
          <div class="footer-section">
            <div class="footer-line">This is a System Generated payslip and does not required signature.</div>
            <div class="footer-line">Generated by <strong>The Vocalearn Educorp</strong></div>
            <div class="footer-line"><strong>For More Details, Login to realapple.in</strong></div>
          </div>
        </div>
      </body>
      </html>
      `

      // Create a temporary container to render HTML for PDF conversion
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.width = '800px'
      tempDiv.style.backgroundColor = '#ffffff'
      tempDiv.innerHTML = salarySlipHTML.replace(
        /<div class="print-instructions[^>]*>.*?<\/div>/gs,
        ''
      )
      document.body.appendChild(tempDiv)

      try {
        // Wait for images to load
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Convert HTML to canvas
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          logging: false,
          width: 800,
          windowWidth: 800,
          backgroundColor: '#ffffff',
        })

        // Remove temporary div
        document.body.removeChild(tempDiv)

        // Create PDF
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        // Fit content into roughly half of the A4 page height.
        // This removes the "full page / large whitespace" look caused by centering + margins.
        const halfPageHeight = pdfHeight * 0.52
        const ratio = Math.min(pdfWidth / imgWidth, halfPageHeight / imgHeight)
        const imgScaledWidth = imgWidth * ratio
        const imgScaledHeight = imgHeight * ratio
        const xOffset = (pdfWidth - imgScaledWidth) / 2
        const yOffset = 0

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight)

        // Generate filename
        const employeeName = (employeeData.name || 'Employee').replace(/\s+/g, '_')
        const monthName = getMonthName(month)
        const filename = `Salary_Slip_${employeeName}_${monthName}_${year}.pdf`

        // Download PDF
        pdf.save(filename)
      } catch (error) {
        console.error('Error generating PDF:', error)
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv)
        }
        throw error
      }
    },
    [],
  )

  const generateSalarySlip = useCallback(
    async (employeeData, payrollData, month, year, defaultRoleOptions, windowIndex = 0, companyAddress = '', notePurpose = 'both') => {
      try {
        const data = employeeData || employeeData?.data || employeeData
        if (!data) throw new Error('Employee data is required')

        // Extract employee information
        const employeeName =
          data.profile?.name ||
          data.general?.firstName + ' ' + (data.general?.lastName || '') ||
          data.name ||
          'Employee'

        const empId =
          data?.employee_id ||
          data?.profile?.employeeId ||
          data?.employment?.employeeId ||
          data?.employment?.employee_id ||
          'N/A'

        const roleId = data?.profile?.role?.[0]
        const designation =
          defaultRoleOptions?.find((r) => String(r.value) === String(roleId))?.label ||
          data.employment?.designation ||
          data.designation ||
          'Employee'

        const companyName = data.employment?.companyName || 'Madhukar Associates'
        const location = data.employment?.location || 'Ratlam'
        const address = data.employment?.address || 'MJR-06, Ratanpuri, 80Ft Road, Ratlam (M.P)'
        const contactNumber = data.profile?.phone || data.general?.phone || data.phone || ''
        const joiningDate = data.employment?.joiningDate || data.profile?.joiningDate || ''
        const employeeType = data.employment?.employeeType || 'Regular'
        const department = data.profile?.department || data.employment?.department || 'N/A'
        
        // Bank details
        const bankName = data.bank?.bankName || data.bank_name || 'N/A'
        const accountNumber = data.bank?.accountNumber || data.account_number || 'N/A'
        const panNumber = data.personal?.panNo || data.personal?.pan_no || data.panNo || data.pan_no || 'N/A'

        // Prepare employee data object
        const formattedEmployeeData = {
          name: employeeName,
          employeeId: empId,
          designation,
          department,
          companyName,
          location,
          address,
          contactNumber,
          joiningDate,
          employeeType,
          bankName,
          accountNumber,
          panNumber,
        }

        // Generate salary slip (await to ensure PDF is downloaded before next)
        await generatePrintBasedPDF(formattedEmployeeData, payrollData, month, year, windowIndex, companyAddress, notePurpose)
      } catch (error) {
        console.error('Error generating salary slip:', error)
        let errorMessage = 'Error generating salary slip. Please try again.'
        if (error.message.includes('Employee data is required')) {
          errorMessage = 'Employee data is missing. Please refresh and try again.'
        }
        toast.error(errorMessage)
      }
    },
    [generatePrintBasedPDF],
  )

  return { generateSalarySlip }
}

export const useSalarySlipGenerator = () => {
  const generator = SalarySlipGenerator()
  return generator
}

export default SalarySlipGenerator

