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

const SALAgreementLetterGenerator = () => {
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
      const shortCompanyName = employeeData.shortCompanyName || 'Real Apple’s'
      const location = employeeData.location || 'Ratlam'
      const CtcInNumber = employeeData.CtcInNumber || '0/-'
      const CtcInWords = employeeData.CtcInWords || 'Twelve Thousand Only'
      const HraInNumber = employeeData.HraInNumber || '0/-'
      const HraInWords = employeeData.HraInWords || 'Four Thousand Only'
      const dates = employeeData.joiningDate || new Date().toLocaleDateString('en-IN')
      const workType = employeeData.workType || 'Not specified'
      const letterHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SAL Agreement Letter - ${employeeData.name || 'Employee'}</title>
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
          .recipient { font-size: 14px; margin-bottom: 20px; }
          .subject { text-align: center; font-size: 18px; font-weight: bold; text-decoration: underline; margin: 20px 0;  padding: 8px 16px; }
          .letter-body { font-size: 14px; line-height: 1.8; text-align: justify; margin-bottom: 20px; }
          .highlight { background-color: #ffff99; padding: 2px 4px; font-weight: bold; }
          .name {margin-left: 20px;}
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
            <h3>📄 SAL Agreement Letter Ready for Download</h3>
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
            <div><strong>Reference No:</strong> <span class="highlight">${
              employeeData.employeeId
            }</span></div>
            <div><strong>Date:</strong> <span class="highlight">${currentDate}</span></div>
          </div>

          <div class="subject">SERVICE AGREEMENT & EMPLACEMENT LETTER</div>

          <div class="recipient">
            <strong>To,</strong> <br/><span class="highlight name">${
              employeeData.name || 'Employee'
            },</span><br/>
            <span class="highlight name">S/O:${employeeData.fatherName || ' not provided'},${
        employeeData.address || ' not provided'
      }</span>
          </div>


          <div class="letter-body">
            <p>Dear <span class="highlight">${
              employeeData.name || 'Employee'
            }</span>_<span class="highlight">${employeeData.fatherName || 'Not specified'}</span>
            (<span class="highlight">${employeeData.employeeId}</span>),<br/>
            With reference to your application and interviews had with you, we are pleased to appoint you as, 
            <strong><span class="highlight-pink">${employeePosition}</span></strong>  under of <strong><span class="highlight-pink">${companyName}</span></strong>
            with effective from <span class="highlight">${dates}</span> on the following terms & conditions..
            
            </p>
                <div style="margin-top: 15px; line-height: 1.6;">
            <div style="font-weight: 600; font-size: 16px;  ">Type of Employment</div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
                The Employee will be employed on the following basis:
                <b><span class="highlight">${workType}</span></b>.
            </li>
            </ul>

            <div style="font-weight: 600; font-size: 16px;  ">Probation</div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
                You shall be on probation for a period of
                <b>3 months</b> from the Commencement Date.
            </li>
            <li>
                During the probation period, the <span class="highlight">${shortCompanyName}</span> may terminate your Employment
                if your performance does not meet their expectations or standards.
            </li>
            </ul>
            <div style="font-weight: 600; font-size: 16px;  ">Location of Employment</div>
             <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
                You shall be employed at the
                <b class = "hightlight"> ${companyName}</b>  at <span class="highlight">${location}</span>and Nearby location or
                 such other place that the ${shortCompanyName} may require from time to time.
            </li>
            <li>
               The <span class="highlight">${shortCompanyName}</span> may at its sole and absolute discretion transfer you to any other office of the 
               <span class="highlight">${shortCompanyName}</span>within India.
            </li>
             <li>
              You hereby agree to travel to such parts of India and the world as necessary for the discharge of your duties as the
                <span class="highlight">${shortCompanyName}</span> may direct or authorize.
            </li>
            </ul>

            <div style="font-weight: 600; font-size: 16px;  ">Office Hours</div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
            The <span class="highlight">${shortCompanyName}</span> normal business hours are 8:30 Hours daily. (Otherwise than on all holidays as notified in writing by the <span class="highlight">${shortCompanyName}</span>  from time to time).
            </li>
             <li>
                    The Employee will be expected to work 45 hours a week.
           </li>
              <li>
                 The office hours may be amended by the <span class="highlight">${shortCompanyName}</span> from time to time. However, the <span class="highlight">${shortCompanyName}</span> has the right to require you to work such 
                 further hours on weekdays/weekends and on other notified holidays.
           </li>
              <li>
               Any late present, Half day or leave taken against <span class="highlight">${shortCompanyName}</span>  policy may fine you as authority or policy.

           </li> 
            </ul>

            <div style="font-weight: 600; font-size: 16px;  ">Attendance and Time: </div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li> 
              Expecting to arrive on time for scheduled work hours.
              </li>
                <li> 
              <span class="highlight">${shortCompanyName}</span> standard office working hours are Morning 10:00 AM to 7:00 PM, and specifying whether 
              flexible working hours or remote work arrangements are allowed.
              </li>
                  <li> 
              <span class="highlight">${shortCompanyName}</span> official regularly required your genuine punch
               in and punch out to smooth bond and avoid the any policy inter fire.
              </li>
             <li> 
                   During office hours, the lunch and short break time will be in the office 35 minutes. (1:25PM to 2:00PM)
             </li>
              <li> 
                   Every two days late punch in after 10.30am, or any without information punch in till 11.00am will results in a half-day count for attendance.
             </li>
             <li>
                    In case of delay sending information or same day taken leave will cause you penalty as per senior or policy.
             </li>
            </ul>

            <div style="font-weight: 600; font-size: 16px;  ">Workplace </div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
              Do professionally acceptable behavior in the workplace, maintaining respect, work confidentiality, and avoiding conflicts of interest.
            </li>
            <li>
                Work safe and inclusive at workplace, prohibiting any form of discrimination, harassment, or bullying based on factors such as race, gender, religion, or sexual orientation.
            </li>

             <li>
                Effective and professional communication with among employees and colleagues in all manners.
            </li>
             <li>
                Present yourselves in a professional and tidy manner that aligns with the company's image and values.
            </li>
             <li>
                Adopting a business casual dress code, this allows for more relaxed and comfortable attire while maintaining a level of professionalism. This may include formals/casuals collared shirts, slacks, skirts, blouses, or dresses that are appropriate for a business setting.
            </li>
             <li>
                Aware about any demand with client or third-party client, directly or indirectly approach will terminate your job immediately and Company will take legal action.
            </li>
             <li>
                Any personal working, lead transfer, Data Sharing, Data or format using for personal or professional, lead generation or favors to others benefit will not be considerable. If any found, company will terminate you immediately along with Company will take legal action.
            </li>   
            // Here we need to add the Sign...

            <div style="font-weight: 600; font-size: 16px;  ">Holiday and Leaves </div>

            <li>
                Now onwards, monthly leaves will be Sundays Leave, only except Holidays Declared as per Policy of Branch. Working last Sundays will be considered as PAID Leave. 
            </li>
            <li>
                Without any single holiday if you complete 6 months then you are entitled to get extra credit of 10 days. 
            </li>
            <li>
                If you will take 1-6 leave in every 6 months cycle then you will not be entitled for 4 days extra credit.
            </li>
            <li>
                Maximum Leave will be sanctioned is 4 Days in a Month. 
            </li>
            <li>
                You are initially getting 16 days as unpaid leave annually, but it is accrued for 4 leave per quarter, in case, extend days will cause you double penalty. And remaining under penalties leaves will credit you in the last of year.
            </li>
            <li>
                You are also entitled to get 12 days of casual/sick leave in a year. (Casual/sick leave balance, if any, at the end of the calendar year will be lapse automatically.)
            </li>
            <li>
                If you are present in the office for Six hours or less, that day will be counted as half day.
            </li>
              <li>
                Post Holidays, every team member should attend/report the office on time, on next working day, otherwise it will count as Leave. 
            </li>
              <li>
                All team members essentially need to take leave approval from respective to HR and Branch Head or Reporting Authority at least 6 days before of the planned leave. 

            </li>
              <li>
                Leaves granted cannot be more than 2 days in one go. In case of leave application more than 2 days, request of the same should be forwarded to Nitika Airan /Manish k Patidar/Nikunj Bansal.
            </li>
            
            </ul>
           
            <div style="margin-top: 20px; line-height: 1.6;">
            <div style="font-weight: 600; font-size: 16px;">Salary Deduction</div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
            In case of leaves exceeding paid leaves, amount deduction will be done as follows:
            </li>

            <table border="1" cellspacing="0" cellpadding="6" style="
            border-collapse: collapse;
            width: 100%;
            text-align: center;
            font-size: 14px;
            ">
            <thead style="background-color: #f2f2f2; font-weight: 600;">
                <tr>
                <th style="width: 40%;">DATE</th>
                <th>% of Basic Salary of 1 day</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>From 25th to 5th every month</td>
                <td>1.5 Times</td>
                </tr>
                <tr>
                <td>From 6th to 15th every month</td>
                <td>1 Times</td>
                </tr>
                <tr>
                <td>From 16th to 24th every month</td>
                <td>1.25 Times</td>
                </tr>
            </tbody>
            </table>
            </div>
            </ul>

            <div style="font-weight: 600; font-size: 16px;">Promotions</div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
                To get a promotion, showcase exceptional work, committed with responsibility, take on new responsibilities, build strong relationships, demonstrate leadership skills, seek feedback, show initiative, exceed expectations, and communicate your aspirations to superiors.
            </li>

            <li>
            
            </li>
            <li>
            Your annual increment will be granted subject to your satisfactory performance as judged by the <span class="highlight">${shortCompanyName}</span> management.
            </li>
            <li>
            Format at Site and Report preparation is to be done in perfection without error.
            </li>
    
            </ul>

            <div style="font-weight: 600; font-size: 16px;">Termination & Resigning </div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
                This Contract shall be terminated forthwith: 
                <ul style="margin: 8px 0 12px 20px;list-style-type: upper-roman;">
                <li>
                    In the event of your death.
                </li>
                <li>
                Upon the dissolution of the Company.
                </li>
                </ul>
            </li>

            <li>
                Upon confirmation of your zero performance, your Employment may be terminated by <span class="highlight">${shortCompanyName}</span>  by giving the following notice. The <span class="highlight">${shortCompanyName}</span>  may terminate your Employment by paying you a salary in lieu of notice. It is hereby clarified that the term 'salary' for the purpose of this clause shall mean the proportionate monthly CTC and shall not include any other compensation payable to the Employee by the <span class="highlight">${shortCompanyName}</span> .
            </li>
             <li>
                Will not give any File as Loan, confidential information and personal contact No. of Loan officer, it will be considered as fraud and immediate action be taken as terminate and Penalty.
            </li>
             <li>
                There will a Notice period of Month for a Trainee/intern Staff and 2 Month for Regular Staff, Senior Staff3 months minimum or as decided by Management.
            </li>
             <li>
             If you purport to terminate your job without notice or prior to the completion of the notice period specified above, you hereby agree to relinquish last 2 month’s salary for that part of the notice period that is not fulfilled.
            </li>
             <li>
                Signature of this letter means I am committed to working with the company for duration of            24 months, contributing to Real Apple success and growth.
            </li>
             <li>
                In case of job left without notice period (Specified Above) Company has reserved rights to reclaim the amount from your Full and Final settlement.
            </li>
             <li>
                From date of notice period ROI will apply on your advance amount. (If taken amount in advance)
            </li>
             <li>
                All documents, plans, drawings, prints, trade secrets, technical information, reports, statements, correspondence etc., written or unwritten and also information and instructions that pass through you or come to your knowledge shall be treated as confidential. You shall not utilize them for your own use or disclose to other persons during or after your employment, we are sure that you are strictly follow confidentiality of Company and client in all case.
            </li> 
              <div style="font-weight: 600; font-size: 16px; margin-top: 20px; display: flex; flex-direction: column; align-items: flex-end;"> 
                <p style="margin: 0;">Signature</p>
                  <span style="display: inline-block; width: 250px; border-bottom: 1px solid #000; margin-top: 5px;"></span>
             </div>

            </ul>

            <div style="font-weight: 600; font-size: 16px;">Expenses </div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
                Expenses information must forward or inform with email communication for approvals in written.
            </li>
             <li>
                Cash amount form Visit, MAP and planning or estimate need to be submitted to the Company and generate invoice in the name of firm with immigrate effect and update to BM and account department. 
            </li>
             <li>
                Field Engineers are required to submit their weekly expenses regularly. Reimbursements will be processed as per the approved regulations. In case of delays in submission without a valid reason, a deduction of ₹0.50 per kilometer may be applied
            </li>
            </ul>

            <div style="font-weight: 600; font-size: 16px;">Travelling and Hotel Accommodation </div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
                Staff members are encouraged to use bicycles for office-related travel whenever possible.
            </li>
             <li>
                The company will reimburse bike petrol & maintenance expenses at a rate of Rs. 3 per kilometer for office use only.
            </li>
             <li>
                Staff senior members may use a car for travel on approval by HR department.
            </li>
             <li>
                Approval should be obtained in advance and documented.
            </li>
             <li>
                Car usage approval will be on special and high value case related purposes only.
            </li>
             <li>
                Staff members must provide valid receipts from approved hotels for reimbursement.
            </li>

                <li>
                Hotel stays should be within reasonable proximity to the business location.
            </li>
             <li> 
                Unapproved accommodations will not be reimbursed.
            </li>
              <li> 
                If a staff member travels 100 kilometers one way for business purposes but does not stay overnight, an additional reimbursement of Rs. 100 per 100 kilometers will be provided.
            </li>
              <li> 
                This additional reimbursement is applicable only if the staff member does not stay the night.
            </li>
              <li> 
                All travel expenses, including hotel and food bills, should be submitted for reimbursement.
            </li>
              <li> 
            Staff members are required to provide accurate and itemized receipts for all expenses.
            </li>

            <li>
                Expense claims should be submitted by every Friday or Saturday to the finance department for processing.
            </li>

            </ul>

             <div style="font-weight: 600; font-size: 16px;">Payouts </div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
            Your CTC per Month will be Rs.<span class="highlight">${CtcInNumber}</span>/- (<span class = "hightlight">${CtcInWords}</span>).
            </li>
            <li>
            Applicable petrol expense will be 2.5 Rupees per km (calculation done by average mileage is 45 Km/Liter) a 50 Paisa Per KM as Maintenance Charges. (if applicable)
            </li>
             <li>
                Applicable petrol expense from office to office or office use only.
            </li>
             <li>
                The monthly payout will occur on the 10th of each month, following proper protocol and adherence to established procedures.
            </li>
            </ul>

             <div style="font-weight: 600; font-size: 16px;">Notices </div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
            Any notice or other written communication given under or in connection with this Contract must be delivered personally or sent by Registered post AD.
            </li>
            <li>
            The <span class="highlight">${shortCompanyName}</span> address for service shall be its registered office or such other place as the <span class="highlight">${shortCompanyName}</span> may notify from time to time.
            </li>
            <li>
            Your address for service shall be the address given at the head of this Contract or any other place that you may notify.
            </li>
            <li>
            You must notify the <span class="highlight">${shortCompanyName}</span> in writing of any change in your name, address, bank account number, marital status or next of kin within one month of such change.
            </li>
            <li>
            There will a Notice period of Month for a Trainee/intern Staff and 2 Month for Regular Staff, Senior Staff 3 months minimum or as decided by Management.
            </li>
            <li>
            Resigning Notice Period about DJFM will be minimum 110 Days and. except remaining months as per mentioned above.
            </li>
            </ul>

             <div style="font-weight: 600; font-size: 16px;">Incentive & Awards </div>   
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
            An incentive will be added to salary for a work done by you. Everything has little condition which is mentioned below.
            </li>

            <li>
            Incentive will start added after 6 months from your DOJ as mentioned in your Agreement.
            </li>
              <li>
            Applicable Incentive amount will be paid in April- May of Month of for Previous Financial Year, condition is employee have to work till that time.
            </li>
              <li>
            In case of exit job, before financial year closing incentive amount and benefits will be lapse.
            </li>
              <li>
            In FE Reward/Incentive will be given to engineer who have his own Bike only.

            </li>
              <li>
                Reward will be deducted if visit, Draft, RC not done in proper manner, having issues like identification, data submission, photographs, Rate and TAT.
            </li>
              <li>
            To get monthly rewards/Incentive Employee has to send Incentive data every month only. 
            </li>
              <li>
            To get this reward work has to be done within given TAT.
            </li>
              <li>
            Incentive is depending on designation and years of experience, for this contact with HR Department. 
            </li>
            </ul>

         <div style="font-weight: 600; font-size: 16px;">Deductions </div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
            You consent to the <span class="highlight">${shortCompanyName}</span>  deducting from any sum otherwise payable to you by reason of the Employment (or its termination) the value of any claim that the <span class="highlight">${shortCompanyName}</span>  may have against you, including but not limited to:
                <ul style="margin: 8px 0 12px 20px; list-style-type: circle;">
                <li>Any damages or fine May have made by you on your own mistake.</li>
                <li>Overpayment of expenses incurred by you in carrying out your duties</li>
                <li>Loans which the <span class="highlight">${shortCompanyName}</span>  may have made to you from time to time.</li>
                <li>Any advance on salary, which the <span class="highlight">${shortCompanyName}</span>  may have made to you from time to time.</li>
                </ul>

                  
            </li>
            </ul>

              <div style="font-weight: 600; font-size: 16px;">Amendments</div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
                The <span class="highlight">${shortCompanyName}</span>  reserves the right to make reasonable changes to any of the terms and conditions of Employment and you shall be notified of such changes by way of a general notice to all employees. Any such changes shall take effect from the date of the notice.
            </li>
             <li>
                The <span class="highlight">${shortCompanyName}</span>  shall give 1 month's written notice of what it considers to be any significant change, either by way of an individual notice or a general notice to all employees.
            </li>
            </ul>

            <div style="font-weight: 600; font-size: 16px;">Duties </div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
                The Employee will be required to perform all tasks and will be required to accept all duties and responsibilities as reasonably requested by the <span class="highlight">${shortCompanyName}</span>  from time to time. (Contact with HR Department for JD reviews.) 
            </li>
              <li>
            Your duties include may reasonably be assigned to you from time to time to meet the needs of the <span class="highlight">${shortCompanyName}</span> .
            </li>
              <li>
                The <span class="highlight">${shortCompanyName}</span> may from time to time make changes to the position description or to the Employee's Duties, provided that such changes are reasonable in the context of the company side and in the context of the Employee's position.
            </li>
              <li>
            The <span class="highlight">${shortCompanyName}</span> and the Employee may from time to time agree to make changes to the position description or to the Employee's Duties.
            </li>
              <li>
                The Employee agrees to perform the Employee's Duties in accordance with:
                <ul style="margin: 8px 0 12px 20px; list-style-type: circle;">
                <li>This Agreement, and</li>
                <li>The directions, instructions, requests, and orders of the <span class="highlight">${shortCompanyName}</span>, and</li>
                <li>Any of the <span class="highlight">${shortCompanyName}</span> guidelines, practice manuals, policies, or procedures as they exist from time to time.</li>
                </ul>
            </li>
              <li>
            The Employee must perform the Employee's Duties in good faith having regard to the best interests of the <span class="highlight">${shortCompanyName}</span>, and in a careful, conscientious, and professional manner.
            </li>
              <li>
            One Team member cannot work on individual basis without permission; it will be count as breach of contract.
            </li>

            <li>
            There should not be any exchange with Clients, Hospitality, Gifts, Cash and anything that affects the services. 
            </li>

            <li>
            The Employee should have Valid Driving License, Insurance of Bike, and Helmet while driving. In case Bike is of Company, in That Case Also, be assure that insurance is done or not. 
            </li>

            </ul>

            <div style="font-weight: 600; font-size: 16px;">Communication and Collaboration: </div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
                Required effective communication and collaboration within the applicant, Bank and project management.
            </li>
            <li>
                Act Collaborative work with the colleague at workplace.
            </li>
            <li>
                Your regular Collaboration will be with Branch Manager and Report Checker Departments or Mr. Nikunj Bansal for more efficiency and quality.
            </li>
            <li>
                A daily conceal must be done at 7:30 PM with your Mentor or Branch Manager.
            </li>

            </ul>

              <div style="font-weight: 600; font-size: 16px;">Dispute Resolution and Jurisdiction </div>
            <ul style="margin: 8px 0 12px 20px; list-style-type: disc;">
            <li>
                Any dispute, controversy or claims arising out of or relating to this Agreement or the breach, termination or invalidity thereof, shall be settled by arbitration in accordance with the provisions of the [Indian] Arbitration and Conciliation Act, 1996.
            </li>
            <li>
                The place of arbitration shall be at Ratlam, Madhya Pradesh 457001
            </li>
            <li>
            The arbitral procedure shall be conducted in the English shall be rendered in English. The procedural law of the arbitration shall be Indian law.
            </li>
             
            </ul>

            <div >
               <b>
                <p>Please return a signed copy of this letter to indicate your understanding and acknowledgement of the terms and conditions contained herein. (After Signature Please submit a original copy at  <span class="highlight">${shortCompanyName}</span> HR Department)</p>
               </b>
            </div>

              <div style="margin-top: 25px; line-height: 1.6; font-size: 15px;">
                    <div style="font-weight: 600; font-size: 16px; text-decoration: underline; margin-bottom: 10px;">
                    Please Provide Reference as Mentioned:
                    </div>

                    <div style="margin-bottom: 15px;">
                    <p style="font-weight: 600; margin: 4px 0;">Last Employment Organization:</p>
                    <p>Full Name: <span style="display:inline-block; width:240px; border-bottom:1px solid #000;"></span>
                        Contact No.: <span style="display:inline-block; width:240px; border-bottom:1px solid #000;"></span></p>
                    <p>Address: <span style="display:inline-block; width:250px; border-bottom:1px solid #000;"></span>
                        Email ID: <span style="display:inline-block; width:230px; border-bottom:1px solid #000;"></span></p>
                    </div>

                    <div style="margin-bottom: 15px;">
                    <p style="font-weight: 600; margin: 4px 0;">Guardian or Family Member:</p>
                    <p>Full Name: <span style="display:inline-block; width:240px; border-bottom:1px solid #000;"></span>
                        Contact No.: <span style="display:inline-block; width:240px; border-bottom:1px solid #000;"></span></p>
                    <p>Address: <span style="display:inline-block; width:250px; border-bottom:1px solid #000;"></span>
                        Email ID: <span style="display:inline-block; width:230px; border-bottom:1px solid #000;"></span></p>
                    </div>

                    <div style="margin-bottom: 15px;">
                    <p style="font-weight: 600; margin: 4px 0;">Any Neighbor or Colleagues:</p>
                    <p>Full Name: <span style="display:inline-block; width:240px; border-bottom:1px solid #000;"></span>
                        Contact No.: <span style="display:inline-block; width:240px; border-bottom:1px solid #000;"></span></p>
                    <p>Address: <span style="display:inline-block; width:250px; border-bottom:1px solid #000;"></span>
                        Email ID: <span style="display:inline-block; width:230px; border-bottom:1px solid #000;"></span></p>
                    </div>

                    <p style="margin-top: 20px; text-align: justify;">
                    I <span style="display:inline-block; width:240px; border-bottom:1px solid #000;"></span>
                    confirm that I have read “SAL” (Staff Agreement Letter) and I understood the aforesaid contract fully and by signing and returning to the <span class="highlight">${shortCompanyName}</span> the duplicate copy hereof. I hereby accept the terms and conditions contained therein and agree that the same constitutes a valid and binding contract of employment between me and the <span class="highlight">${shortCompanyName}</span>.
                    </p>

                    <p style="margin-top: 15px;">Name of Employee:
                    <span style="display:inline-block; width:250px; ">${employeeData.name}</span>
                    </p>

                    <p style="font-weight: 600; margin-top: 10px;">Employee Signature</p>

                    <p style="margin-top: 5px;">
                    Date: <span style="display:inline-block; width:220px; border-bottom:1px solid #000;"></span><br>
                    Place of Sign the Agreement:
                    <span style="display:inline-block; width:200px; border-bottom:1px solid #000;"></span>
                    </p>
                </div>

            </div>



           
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
  <title>SAL Agreement Letter  - ${employeeData.name || 'Employee'}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 0; padding: 20px; }
    .letter-container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px;  }
    .company-name { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
    .branches { font-size: 12px; color: #666; background-color: #ffb6c1; padding: 4px 8px; display: inline-block; margin-bottom: 10px; }
    .contact-info { font-size: 10px; color: #333; }
    .letter-details { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
    .recipient { font-size: 14px; margin-bottom: 20px; }
    .subject { text-align: center; font-size: 18px; font-weight: bold; text-decoration: underline; margin: 20px 0;   padding: 8px 16px;   }
    .letter-body { font-size: 14px; line-height: 1.8; text-align: justify; margin-bottom: 20px; }
    .highlight { background-color: #ffff99; padding: 2px 4px; font-weight: bold; }
    .name {margin-left: 20px;}
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

      toast.success(
        'SAL Agreement Letter opened. Use Ctrl+P to save as PDF or buttons to download.',
      )
    },
    [],
  )

  const generateSALAgreementLetter = useCallback(
    (employeeData, defaultRoleOptions) => {
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
          data.general?.firstName + ' ' + (data.general?.lastName || '') ||
          'Employee'
        const fatherName = data.personal?.fatherName || 'Not specified'
        const employeeId = empId
        const address =
          data.personal?.currentAddress || data.personal?.permanentAddress || 'Address not provided'

        const roleId = data?.profile?.role?.[0]
        const employeePosition =
          defaultRoleOptions?.find((r) => String(r.value) === String(roleId))?.label || 'Employee'

        const companyName = data.employment?.companyName || 'Madhukar Associates'
        const shortCompanyName =
          companyName
            .split(' ')
            .filter(Boolean)
            .map((word) => word[0].toUpperCase())
            .join('') + '’s'

        const location = data.employment?.location || 'Ratlam'
        const joiningDate = new Date(data.employment?.joiningDate || Date.now()).toLocaleDateString(
          'en-IN',
        )
        const CtcInNumber = data.employment?.ctcPerMonth
          ? `${data.employment.ctcPerMonth}/-`
          : '0/-'
        const CtcInWords = data.employment?.ctcPerMonthInWords || 'Twelve Thousand Only'
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
        const workType = data.employment?.workType || 'Not specified'
        // Prepare simplified object for letter
        const formattedData = {
          name: employeeName,
          fatherName,
          employeeId: employeeId,
          address,
          position: employeePosition,
          companyName,
          shortCompanyName,
          location,
          joiningDate,
          CtcInNumber,
          CtcInWords,
          HraInNumber,
          HraInWords,
          workType,
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

  return { generateSALAgreementLetter }
}

// Custom hook for using WelcomeLetterGenerator
export const useSALAgreementLetterGenerator = () => {
  const generator = SALAgreementLetterGenerator()
  return generator
}

export default SALAgreementLetterGenerator
