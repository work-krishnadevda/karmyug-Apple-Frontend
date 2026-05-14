import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CRow,
  CSpinner,
} from '@coreui/react'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import { useNavigate } from 'react-router-dom'
import ExcelJS from 'exceljs'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import BasicProvider from 'src/constants/BasicProvider'
import { customSuccessMSG } from 'src/helpers/alertHelper'

const BulkUpload = () => {
  const fileInputRef = useRef()
  const dispatch = useDispatch()

  const navigate = useNavigate()

  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const [isLoading, setIsloading] = useState(false)
  const [popVisible, setPopVisible] = useState(false)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile)
      setError('')
    } else {
      setFile(null)
      setError('Please upload a valid .xlsx file.')
    }
  }


  useEffect(() => {
    if (popVisible) {
      const timer = setTimeout(() => {
        setPopVisible(false);

      }, 3000);



      return () => clearTimeout(timer);
    }
  }, [popVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (file) {
      try {
        setIsloading(true)

        const formData = new FormData()
        formData.append('featured_image', file)
        formData.append('isBulkUpload', true)

        let response = await new BasicProvider(`cases/create`, dispatch).postRequest(formData)

        if (response?.data?.message) {
          setIsloading(false)
          setPopVisible(true)
          setFile(null);
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error during submission:', error)
        setIsloading(false)
        setFile(null);
        fileInputRef.current.value = '';
        dispatch({ type: 'set', validations: [error.data] })
      } finally {
        setIsloading(false)
        setIsloading(false)
        setFile(null);
        fileInputRef.current.value = '';

      }
    } else {
      setError('Please upload a file before submitting')
      setIsloading(false)
      setIsloading(false)
      setFile(null);
      fileInputRef.current.value = '';
    }
  }


  const generateExcel = async (data) => {
    try {
      let response = await new BasicProvider(`cases/download/sample-xlsx`, dispatch).getRequest()
      if (response) {
        let data = response.data

        const workbook = new ExcelJS.Workbook()
        const sheet1 = workbook.addWorksheet('Sheet1')
        const sheet2 = workbook.addWorksheet('Sheet2')

        const columns = Object.keys(data[0]).map((key) => ({
          header: key,
          key: key,
        }))

        sheet1.columns = columns

        // Add data to Sheet1
        data.forEach((row) => {
          const rowData = {}
          Object.entries(row).forEach(([key, value]) => {
            rowData[key] = Array.isArray(value) ? value[0] : value
          })
          sheet1.addRow(rowData)
        })

        // Create dropdowns in Sheet1 and populate Sheet2
        const dropdownFields = [
          'finance_name_perent',
          'finance_name',
          'case_type',
          'ra_branch',
          'engineers',
          'group',
          'product_type',
        ]
        dropdownFields.forEach((field, index) => {
          const column = sheet1.getColumn(field)
          const columnLetter = String.fromCharCode(65 + index)
          const options = data[0][field].filter((option) => option !== 'Select')

          // Populate Sheet2
          sheet2.getCell(`${columnLetter}1`).value = field
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          options.forEach((option, optionIndex) => {
            sheet2.getCell(`${columnLetter}${optionIndex + 2}`).value = option
          })

          // Add validation to Sheet1
          if (options.length > 0) {
            for (let rowNumber = 2; rowNumber <= sheet1.rowCount; rowNumber++) {
              sheet1.getCell(`${column.letter}${rowNumber}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`Sheet2!$${columnLetter}$2:$${columnLetter}$${options.length + 1}`],
              }
            }
          }
        })

        // Auto-adjust column widths in Sheet1
        sheet1.columns.forEach((column) => {
          let maxColumnLength = 0
          column.eachCell({ includeEmpty: true }, (cell) => {
            let columnLength = cell.value ? cell.value.toString().length : 10
            if (columnLength > maxColumnLength) {
              maxColumnLength = columnLength
            }
          })
          column.width = maxColumnLength < 10 ? 10 : maxColumnLength + 2
        })

        // Write the workbook to a buffer
        const buffer = await workbook.xlsx.writeBuffer()

        // Create a blob and save it
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        saveAs(blob, 'bulk upload cases.xlsx')
      }
    } catch (error) {
      console.log('Error while genarete sample:', error)
    }
  }


  return (
    <>
      <SingleSubHeader moduleName={'Bulk Upload Cases'} />
      <CContainer fluid>
        <CCard>
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              Upload File
              <p className="m-0">
                <CButton
                  color="warning"
                  className="d-flex align-items-center justify-content-end"
                  onClick={() => generateExcel()}
                >
                  <FontAwesomeIcon icon={faDownload} className="me-1" />
                  Sample
                </CButton>
              </p>
            </div>
          </CCardHeader>

          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow>
                <CCol md={8}>
                  <CFormInput
                    id="image"
                    type="file"
                    accept=".xlsx"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                </CCol>

                <CCol md={4} className="d-flex justify-content-end align-items-center">
                  <CButton type="submit" disabled={isLoading} style={{backgroundColor:"#045248"}}>
                    {isLoading ? (
                      <>
                        <CSpinner size="sm" className="me-2" />
                        Loading...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </CButton>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>

        <CModal
          alignment="center"
          visible={popVisible}
          onClose={() => setPopVisible(false)}
          className="delete_item_box"
        >
          <CModalBody className="text-center mt-4">
            <div className="logo_check m-auto mb-5">✓</div>
            <h1 className="h4">Uploaded Successfully</h1>
          </CModalBody>
          <CModalFooter className="model_footer justify-content-center mb-3 pt-0"></CModalFooter>
        </CModal>
      </CContainer>
    </>
  )
}

export default BulkUpload
