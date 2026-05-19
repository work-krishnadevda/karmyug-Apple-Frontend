import {
  cilCloudDownload,
  cilPen,
  cilPencil,
  cilPrint,
  cilSpreadsheet,
  cilTrash,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
} from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import BasicProvider from 'src/constants/BasicProvider'

import CommonCaseDetails from 'src/components/custom/department/commoncasedetails'
import AppContentSkeleton from 'src/components/custom/AppContentSkeleton'

import ShowPdfReview from 'src/components/showPdfReview'

export default function Casedetail() {
  var params = useParams()
  const id = params.id
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(null)
  const location = useLocation()

  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  //const [currentStep, setCurrentStep] = useState(1)
  //const totalSteps = 8

  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)

  const [visible, setVisible] = useState(false)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)

  const [feAttachments, setFeAttachments] = useState([])
  const [sdmAttachments, setSdmAttachments] = useState([])
  const [caseUpdateLog, setcaseUpdateLog] = useState([])

  const feRole = process.env.REACT_APP_FE
  const sdmRole = process.env.REACT_APP_SDM
  const URL = process.env.REACT_APP_NODE_URL

  const dispatch = useDispatch()

  const [initialValues, setInitialValues] = useState('')

  const [pdfURL, setPdfURL] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {

      const data = await new BasicProvider(`cases/show/${id}`, dispatch).getRequest()
      const response = data.data
      setInitialValues(response)

      const feFileResponse = await new BasicProvider(
        `cms/files/by/roles/${feRole}?paeg=${1}&count=${10}&id=${id}`,
      ).getRequest()

      const feFiles = feFileResponse.data.data

      setFeAttachments(feFiles && feFiles.reverse())

      const sdmFileResponse = await new BasicProvider(
        `cms/files/by/roles/${sdmRole}?paeg=${1}&count=${10}&id=${id}`,
      ).getRequest()

      const sdmFiles = sdmFileResponse.data.data
      setSdmAttachments(sdmFiles)

      const caseUpdateLogRes = await new BasicProvider(
        `case-update-logs?paeg=${1}&count=${5}&id=${id}`,
      ).getRequest()

      setcaseUpdateLog(caseUpdateLogRes?.data?.data)
    } catch (error) {
      console.log(error)
    }
  }

  const updatedFinance = (initialValues?.finance_name?.fields || []).map((item) => {
    let updatedItem = { ...item };
    const matchedData = Object.entries(initialValues).find(([key, value]) => item.title === key);

    // Helper function to format dates
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('en-GB', options);
    };

    if (matchedData && matchedData[1] !== undefined && matchedData[1] !== null && matchedData[1] !== '') {
      if (["date_initiation_bank", "date_initiation_RA", "mortaged_month_year"].includes(matchedData[0])) {
        updatedItem.value = formatDate(matchedData[1]);
      } else {
        updatedItem.value = matchedData[1];
      }
    } else if (initialValues.calculation_Json) {
      const calcField = initialValues.calculation_Json[item.title];
      if (calcField !== undefined && calcField !== null && calcField !== '') {
        updatedItem.value = calcField;
      }
    }

    if (initialValues.additional_fields && Array.isArray(initialValues.additional_fields)) {
      const additionalField = initialValues.additional_fields.find((field) => {
        return field?.role?.toLowerCase() === item?.role?.toLowerCase();
      });

      if (additionalField && additionalField[item.title] !== undefined && additionalField[item.title] !== null && additionalField[item.title] !== '') {
        if (["date_initiation_bank", "date_initiation_RA", "mortaged_month_year"].includes(item.title)) {
          updatedItem.value = formatDate(additionalField[item.title]);
        } else {
          updatedItem.value = additionalField[item.title];
        }
      }
    }

    if (updatedItem.value === undefined) {
      updatedItem.value = '';
    }

    return updatedItem;
  });


  useEffect(() => {
    generateReport()
  }, [initialValues])

  const generateReport = async () => {

    if (initialValues && initialValues?.finance_name) {
      setIsLoading(true)

      let fullUrl = `${process.env.REACT_APP_NODE_URL}/api/cms/files/view?key=${initialValues?.finance_name?.featured_image?.filepath}`
      let json = {
        pdf_url: fullUrl,
        data: updatedFinance,
        images: initialValues.fe_images_data,
        images_2: initialValues.dm_images_data,
        page: initialValues?.finance_name?.images_page_no,
        addon_data: initialValues.case_addons,
        header_image: `${process.env.REACT_APP_NODE_URL}/api/cms/files/view?key=${initialValues?.ra_branch?.featured_image.filepath}`,

      }

      try {
        let response = await new BasicProvider('cases/genrate/report').postRequest(json)
        if (response) {
          setPdfURL(response.data.file_url)
          setIsLoading(false)
        }
      } catch (error) {
        setIsLoading(false)
      }
    }
  }

  return (
    <>
      <CContainer fluid>
        <CRow>
          <CCol md={12}>
            <CommonCaseDetails initialValues={initialValues} />
          </CCol>
        </CRow>

        <CRow className="mt-4">
          <CCol md={12}>
            <CCard>
              <CCardHeader>
                <div className="d-flex justify-content-between">
                  <div className="d-flex align-items-center">Report Builder</div>
                  <p className="m-0">
                    {numPages > 0 && (
                      <div className="text-center ">
                        <button
                          className="btn btn-secondary me-2"
                          onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                        >
                          Prev
                        </button>
                        <span>
                          {pageNumber} / {numPages}
                        </span>

                        <button
                          className="btn btn-secondary ms-2"
                          onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </p>
                </div>
              </CCardHeader>

              {isLoading && isLoading ? (
                <CCardBody>
                  <AppContentSkeleton
                    variant="detail"
                    rows={6}
                    ariaLabel="Loading case details"
                  />
                </CCardBody>
              ) : (
                <CCardBody>
                  <CRow>
                    {pdfURL && (
                      <CCol md={12}>
                        <ShowPdfReview
                          numPages={numPages}
                          pageNumber={pageNumber}
                          setNumPages={setNumPages}
                          url={pdfURL}
                        />
                      </CCol>
                    )}
                  </CRow>
                </CCardBody>
              )}
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </>
  )
}
