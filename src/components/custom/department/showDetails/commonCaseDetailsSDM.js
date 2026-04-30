import { CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner } from '@coreui/react'
import {
  faEye,
  faFileExcel,
  faFilePdf,
  faFileWord,
  famap,
  faMapMarker,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import MapData from '../../popup/mapData'
import { handleDownload } from 'src/constants/common'

let FE = process.env.REACT_APP_FE
let COO = process.env.REACT_APP_COO
let SDM = process.env.REACT_APP_SDM
let BM = process.env.REACT_APP_RA
let DM = process.env.REACT_APP_DM
let RC = process.env.REACT_APP_RC
let LCTO = process.env.REACT_APP_LCTO
let CTO = process.env.REACT_APP_CTO

const CommonCaseDetailsSDM = ({
  generateReport,
  reviewReport,
  showCaseData,
  visibleMapModel,
  setVisibleMapModel,
  setMapModelCount,
  additionalFields,
  // fetchSHowCaseData,
  setInitialValues,
  setShowCaseData,
}) => {
  const dispatch = useDispatch()
  let loggedinUserRole = useSelector((state) => state?.userRole)
  const [isLoadingReview, setIsLoadingReview] = useState(false)
  const [isLoadingDownload, setIsLoadingDownload] = useState(false)
  const [downloadingFileKey, setDownloadingFileKey] = useState('')

  const downloadFinanceAsset = async (fileObj, fileKey) => {
    try {
      if (!fileObj) return
      setIsLoadingDownload(true)
      setDownloadingFileKey(fileKey)

      const directDownloadUrl = fileObj?.download_url
      let resolvedUrl = directDownloadUrl

      if (!resolvedUrl && fileObj?.filepath) {
        const res = await new BasicProvider(
          `cms/files/signed-url?key=${encodeURIComponent(fileObj.filepath)}&download=true`,
          dispatch,
        ).getRequest()
        resolvedUrl =
          typeof res?.data === 'string' ? res?.data : res?.data?.url || ''
      }

      if (!resolvedUrl) {
        dispatch({
          type: 'set',
          validations: ['File unavailable or unauthorized. Please refresh and try again.'],
        })
        return
      }

      await handleDownload(resolvedUrl)
    } catch (error) {
      console.error('Error downloading finance asset:', error)
      dispatch({
        type: 'set',
        validations: ['File download failed. Please try again.'],
      })
    } finally {
      setIsLoadingDownload(false)
      setDownloadingFileKey('')
    }
  }

  return (
    <>
      <CCard className="applicant-details mt-4">
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <div>Case Details </div>
          {(loggedinUserRole.name == RC ||
            loggedinUserRole.name == DM ||
            loggedinUserRole.name == LCTO ||
            loggedinUserRole.name == CTO) && (
            <>
              {showCaseData && (
                <>
                  <CRow className="w-lg-50 w-75 justify-content-end">
                    <CCol lg={2} xs={2}>
                      <CCard
                        className="py-1 px-2 text-center submit_btn report_generate_btn"
                        onClick={async () => {
                          setIsLoadingDownload(true)
                          await generateReport()
                          setIsLoadingDownload(false)
                        }}
                      >
                        <div className="mb-1">
                          {isLoadingDownload ? (
                            <CSpinner size="sm" />
                          ) : (
                            <FontAwesomeIcon icon={faFilePdf} />
                          )}
                          <span className="mx-2 d-lg-inline d-none" style={{ fontSize: '13px' }}>
                            {' '}
                            Report
                          </span>
                        </div>
                      </CCard>
                    </CCol>
                    <CCol lg={2} xs={2}>
                      <CCard
                        className="py-1 px-2 text-center submit_btn report_generate_btn"
                        onClick={async () => {
                          setIsLoadingReview(true)
                          await reviewReport()
                          setIsLoadingReview(false)
                        }}
                      >
                        <div className="mb-1">
                          {isLoadingReview ? (
                            <CSpinner size="sm" />
                          ) : (
                            <FontAwesomeIcon icon={faEye} />
                          )}
                          <span className="mx-2 d-lg-inline d-none" style={{ fontSize: '13px' }}>
                            Report
                          </span>
                        </div>
                      </CCard>
                    </CCol>

                    <CCol lg={2} xs={2}>
                      <CCard
                        className="py-1 px-2 text-center  report_generate_btn"
                        style={{ backgroundColor: 'orange', color: 'white' }}
                        onClick={() => {
                          setVisibleMapModel(!visibleMapModel)
                        }}
                      >
                        <CustomTooltip content={'Add Google Map Data'}>
                          <div className="mb-1">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                          </div>
                        </CustomTooltip>
                      </CCard>
                    </CCol>
                    {showCaseData.finance_name?.featured_pdf != null && (
                      <CCol lg={2} xs={2}>
                        <CCard
                          className="py-1 px-2 text-center  report_generate_btn"
                          style={{ backgroundColor: 'orange', color: 'white' }}
                          onClick={() =>
                            downloadFinanceAsset(showCaseData.finance_name?.featured_pdf, 'featured_pdf')
                          }
                        >
                          {}
                          <div className="mb-1">
                            {isLoadingDownload && downloadingFileKey === 'featured_pdf' ? (
                              <CSpinner size="sm" />
                            ) : (
                              <FontAwesomeIcon icon={faFilePdf} />
                            )}
                            <span className="mx-2 d-lg-inline d-none" style={{ fontSize: '13px' }}>
                              Advisory
                            </span>
                          </div>
                        </CCard>
                      </CCol>
                    )}
                    {showCaseData.finance_name?.featured_doc != null && (
                      <CCol lg={2} xs={2}>
                        <CCard
                          className="py-1 px-2 text-center report_generate_btn"
                          style={{ backgroundColor: 'orange', color: 'white' }}
                          onClick={() =>
                            downloadFinanceAsset(showCaseData.finance_name?.featured_doc, 'featured_doc')
                          }
                        >
                          {/* <div className="mb-1 d-flex">
                            {isLoadingDownload ? (
                              <CSpinner size="sm" />
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faFileWord} className="mx-1" />
                                <FontAwesomeIcon icon={faFileExcel} className="mx-1" />
                              </>
                            )}
                            <span className="mx-2 d-lg-inline d-non0 " style={{fontSize:"13px"}}>Format</span>
                          </div> */}
                          <CustomTooltip content={'Format 1'}>
                            <div className="mb-1">
                              <FontAwesomeIcon icon={faFileWord} className="mx-1" />/
                              <FontAwesomeIcon icon={faFileExcel} className="mx-1" />
                            </div>
                          </CustomTooltip>
                        </CCard>
                      </CCol>
                    )}
                    {showCaseData.finance_name?.featured_word != null && (
                      <CCol lg={2} xs={2}>
                        <CCard
                          className="py-1 px-2 text-center report_generate_btn"
                          style={{ backgroundColor: 'orange', color: 'white' }}
                          onClick={() =>
                            downloadFinanceAsset(showCaseData.finance_name?.featured_word, 'featured_word')
                          }
                        >
                          <div className="mb-1">
                            {/* {isLoadingDownload ? (
                              <CSpinner size="sm" />
                            ) : (
                              <FontAwesomeIcon icon={faFileWord} />
                            )} */}
                            {/* <span className="mx-2 d-lg-inline d-non0 " style={{fontSize:"13px"}}>Format</span> */}
                            <CustomTooltip content={'Format 2'}>
                              <div className="mb-1">
                                <FontAwesomeIcon icon={faFileWord} />
                              </div>
                            </CustomTooltip>
                          </div>
                        </CCard>
                      </CCol>
                    )}
                  </CRow>
                </>
              )}
            </>
          )}
        </CCardHeader>

        <CCardBody>
          <CRow>
            <CCol md={3}>
              <span className="custom-lebel my-1">Applicant Name</span>
              <h6>{showCaseData?.applicant_name ?? '-'}</h6>
            </CCol>

            <CCol md={3}>
              <span className="custom-lebel my-1">Finance Name</span>
              <h6>{showCaseData?.finance_name ? showCaseData?.finance_name?.name : '-'}</h6>
            </CCol>

            <CCol md={2}>
              <span className="custom-lebel my-1">CIN Number</span>
              <h6>{showCaseData?.cin_number ?? '-'}</h6>
            </CCol>

            <CCol md={2}>
              <span className="custom-lebel my-1">LOS Number</span>
              <h6>{showCaseData?.los_number ?? '-'}</h6>
            </CCol>

            <CCol md={2}>
              <span className="custom-lebel my-1">Visited By</span>
              <h6>
                {showCaseData && showCaseData?.accepted_by?.name
                  ? showCaseData.accepted_by.name
                  : '-'}
              </h6>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      <MapData
        visible={visibleMapModel}
        close={() => setVisibleMapModel(false)}
        caseId={showCaseData?._id}
        Fetchedmapdata={showCaseData}
        // fetchSHowCaseData={fetchSHowCaseData}
        setInitialValues={setInitialValues}
        setShowCaseData={setShowCaseData}
      />
    </>
  )
}

export default CommonCaseDetailsSDM
