import { CButton, CCard, CCardBody, CCardHeader, CCol, CContainer, CFormLabel, CRow, CSpinner } from '@coreui/react'
import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import moment from 'moment'

const MonthlyReport = () => {
    const admin = useSelector((state) => state.userData)
    const [selectedDate, setSelectedDate] = useState(null)
    const [initialvalue, setInitialvalue] = useState({
        date_from: '',
        date_to: ''
    })

    const [isLoading, setIsLoading] = useState(false)

    const handleMonthChange = (date) => {
        setSelectedDate(date)

        // Get first day of selected month
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        // Get last day of selected month
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        // Format dates for API
        const formatDate = (date) => {
            const timezoneOffset = date.getTimezoneOffset()
            const adjustedDate = new Date(date.getTime() - timezoneOffset * 60 * 1000)
            return adjustedDate.toISOString().split('T')[0]
        }

        setInitialvalue({
            date_from: formatDate(firstDay),
            date_to: formatDate(lastDay)
        })

    }

    const genrateReport = async () => {

        try {
            setIsLoading(true)

            const [year, month] = initialvalue?.date_from.split('-');

            const filename = `${month}-${year}-monthly-report.xlsx`;

            const response = await new BasicProvider(`cases/monthely-report?case_create_from=${initialvalue.date_from}&case_create_to=${initialvalue.date_to}`).getRequest()

            let data = response?.data

            if (data && data.length > 0) {

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet("Report");

                // Get the number of days from the first entry's countsPerDay
                const numberOfDays = data[0].countsPerDay.length

                // Add letterhead rows
                worksheet.mergeCells('A1:AH1')
                worksheet.getCell('A1').value = 'Real Apple Consultancy House'
                worksheet.getCell('A1').font = { size: 16, bold: true }
                worksheet.getCell('A1').alignment = { horizontal: 'center' }

                worksheet.mergeCells('A2:AH2')
                worksheet.getCell('A2').value = `Date of report generation : ${moment(Date.now()).format('D MMMM YYYY')}`
                worksheet.getCell('A2').alignment = { horizontal: 'center' }

                worksheet.mergeCells('A3:AH3')
                worksheet.getCell('A3').value = `Name of user : ${admin.name ? admin.name : '-'}`
                worksheet.getCell('A3').alignment = { horizontal: 'center' }

                if (initialvalue.date_from && initialvalue.date_to) {
                    worksheet.mergeCells('A4:AH4')
                    worksheet.getCell('A4').value = `Date to Date : ${moment(initialvalue.date_from).format('D MMMM YYYY')} to ${moment(initialvalue.date_to).format('D MMMM YYYY')}`
                    worksheet.getCell('A4').alignment = { horizontal: 'center' }
                }

                // Add empty row for spacing
                worksheet.addRow([]);

                // Add header row - dynamic based on number of days
                const headerRow = ["S.No", "Role Name", "Role", ...Array.from({ length: numberOfDays }, (_, i) => (i + 1).toString()), "Total"]
                worksheet.addRow(headerRow);

                const headerRowIndex = 6;
                worksheet.getRow(headerRowIndex).eachCell((cell) => {
                    cell.font = { bold: true };
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFFF00" }
                    };

                    cell.alignment = { vertical: "middle", horizontal: "center" };
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" }
                    };

                });

                // Define the mapping of abbreviations to roleSlugs
                const roleAbbreviations = {
                    FE: [process.env.REACT_APP_FE],
                    DM: [process.env.REACT_APP_DM],
                    RA: [process.env.REACT_APP_RA],
                    SFO: [process.env.REACT_APP_SFO],
                    RC: [process.env.REACT_APP_RC],
                    LCTO: [process.env.REACT_APP_LCTO],
                    CTO: [process.env.REACT_APP_CTO],
                    COO: [process.env.REACT_APP_COO],
                    SDM: [process.env.REACT_APP_SDM]
                };

                // Define the desired sequence of abbreviations
                const desiredSequence = ["FE", "DM", "RA", "RC", "SFO", "LCTO", "CTO", "COO", "SDM"];

                // Group data by roleSlug
                const dataByRoleSlug = data.reduce((acc, entry) => {
                    if (!acc[entry.roleSlug]) {
                        acc[entry.roleSlug] = [];
                    }
                    acc[entry.roleSlug].push(entry);
                    return acc;
                }, {});

                // Collect all entries per role in the desired order
                let orderedData = [];

                desiredSequence.forEach(abbr => {
                    const roleSlug = roleAbbreviations[abbr];
                    const entries = dataByRoleSlug[roleSlug];
                    if (entries) {
                        orderedData = orderedData.concat(entries);
                    }
                });

                // Iterate over orderedData to populate rows
                orderedData.forEach((entry, index) => {
                    const counts = entry.countsPerDay.map((day) => day.count);
                    const total = counts.reduce((sum, count) => sum + count, 0);

                    const row = worksheet.addRow([
                        index + 1,
                        entry.adminName,
                        entry.roleName,
                        ...counts,
                        total,
                    ]);

                    const totalCell = row.getCell(numberOfDays + 4); // Column for "Total"
                    totalCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "ADD8E6" } // Light blue shade
                    };

                    row.eachCell({ includeEmpty: true }, (cell) => {
                        cell.alignment = { vertical: "middle", horizontal: "center" };
                        cell.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" }
                        };
                    });
                });

                // Set column widths
                worksheet.getColumn(1).width = 5;  // S.No
                worksheet.getColumn(2).width = 30; // Role Name
                worksheet.getColumn(3).width = 30; // Role

                // Dynamic columns for days and total
                for (let i = 4; i <= numberOfDays + 4; i++) { // +4 to account for S.No, Role Name, Role, and Total
                    worksheet.getColumn(i).width = 5;
                }

                worksheet.getColumn(numberOfDays + 4).width = 10;

                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                saveAs(blob, filename);
                setIsLoading(false)
            }

        } catch (error) {
            setIsLoading(false)
            console.error(error);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <SingleSubHeader moduleName={'Monthly Report'} />
            <CContainer fluid>
                <CCard>
                    <CCardHeader>Monthly Report</CCardHeader>
                    <CCardBody>
                        <CRow>

                            <CCol xs={12} lg={6} className="">

                                <DatePicker
                                    selected={selectedDate}
                                    onChange={handleMonthChange}
                                    dateFormat="MMMM yyyy"
                                    showMonthDropdown
                                    showYearDropdown
                                    showMonthYearPicker
                                    maxDate={new Date()}
                                    className="form-control full py-2"
                                    placeholderText="Select Month.."
                                />

                            </CCol>
                            <CCol md={6}>
                                <CButton
                                    className="mx-2"
                                    color="success"
                                    style={{ color: 'white' }}
                                    onClick={genrateReport}
                                    disabled={!selectedDate || isLoading}
                                >

                                    {isLoading ? (
                                        <>
                                            <CSpinner color="white" size="sm" />
                                            GENERATE REPORT
                                        </>

                                    ) : (
                                        "GENERATE REPORT"
                                    )}
                                </CButton>

                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            </CContainer>
        </>
    )

}

export default MonthlyReport