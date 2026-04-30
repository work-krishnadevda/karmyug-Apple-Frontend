import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CButton, CCol, CContainer, CRow, CSpinner } from '@coreui/react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { cilSearch, cilSpreadsheet, cilTrash, cilList, cilCloudDownload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import HelperFunction from 'src/helpers/HelperFunctions'
import { useDispatch, useSelector } from 'react-redux'
import { downloadFinalReportZip } from 'src/constants/common'
import BasicProvider from 'src/constants/BasicProvider'


function SingleSubHeader(props) {

  const { handleFilter, selectedRow, moduleName, deletionType, setSearchCurrentPage, onReset, searchInput } = props

  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const dispatch = useDispatch()

  var params = useParams()
  const location = useLocation()
  const id = params.id

  const effectRef = useRef(false)

  let isFromCases = location.pathname.startsWith('/case')

  const [caseData, setCaseData] = useState(null)

  const [zipLoading, setZipLoading] = useState(false)

  const [search, setSearch] = useState(searchInput || '')

  let loggedinUserRole = useSelector((state) => state?.userRole)

  const toggleCleared = useSelector((state) => state.toggleCleared)


  useEffect(() => {
    if (effectRef.current === false) {
      effectRef.current = true
      if(id != null && id != undefined){
        fetchData(id)
      }
    }
  }, [id])


  const fetchData = async (id) => {
    try {
      let response = await new BasicProvider(`cases/show/${id}`, dispatch).getRequest()

      if (response.data) {
        setCaseData(response.data)
      }
    } catch (error) { }
  }


  return (
    <div>
      <CContainer fluid className="subheader-custom py-3 mb-4">
        <CRow xs={{ cols: 1, gutter: 2 }} lg={{ cols: 2, gutter: 3 }}>
          <CCol>
            <div className="create-blog-button d-flex align-items-center">
              {moduleName}
              <span className="ms-2 border-left"></span>

              {Array.isArray(props.selectedRow) && props.selectedRow.length > 0 ? (
                <>
                  <span className="selected_row">{props.selectedRow.length} selected:</span>
                  <CButton
                    className="delete_btn ml-3"
                    onClick={() => {
                      setVisible(true)
                    }}
                  >
                    Delete Selected
                  </CButton>
                </>
              ) : (
                ''
              )}
            </div>
          </CCol>

          <CCol className="text-end  d-flex justify-content-end">
            {props.handleFilter && (

              <>
                <div className="text-end search_bar position-relative">
                  <CIcon icon={cilSearch} className="search_icon" />
                  <input
                    className="search_bar_box"
                    placeholder="Search"
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="mx-2 mt-2 mt-lg-0">
                  <CButton
                    className="add_new"
                    onClick={() => {
                      setSearchCurrentPage(search)
                      handleFilter(search)
                    }}
                  >
                    Search
                  </CButton>
                  <CButton
                    className="add_new ms-2"
                    onClick={() => {
                      onReset()
                      setSearch('')
                    }}
                  >
                    Reset
                  </CButton>
                </div>

              </>
            )}

            {id && isFromCases && (
              <CButton
                color="warning"
                className="add_new ms-2 ms-3"
                onClick={() => navigate(`/case/${id}/logs`)}
              >
                <CIcon icon={cilList} className="me-2" />
                Logs
              </CButton>
            )}

            {loggedinUserRole.name !== process.env.REACT_APP_FE && id && isFromCases && caseData && caseData.status === 'submitted to bank' && (
              <CButton
                className="add_new ms-2 ms-3"
                onClick={() => downloadFinalReportZip(caseData, setZipLoading, dispatch)}
                disabled={zipLoading}
              >
                {zipLoading ? (
                  <CSpinner className='me-2' size="sm" />
                ) : (
                  <CIcon icon={cilCloudDownload} className="me-2" />
                )}
                Download
              </CButton>
            )}

          </CCol>

        </CRow>

        <DeleteModal
          visible={visible}
          selectedRow={selectedRow}
          handleConfirmDelete={async () => {
            dispatch({ type: 'set', selectedrows: [] })
            const success = await handleConfirmDelete(moduleName, deletionType, selectedRow)
            dispatch({ type: 'set', toggleCleared: !toggleCleared })

            if (success && deletionType === 'delete') {
              var response = await HelperFunction.getData(
                `${moduleName.toLowerCase().endsWith('s') ? moduleName.slice(0, -1) : moduleName
                }s/trash`,
                1,
                10,
              )
            } else {
              var response = await HelperFunction.getData(
                `${moduleName.toLowerCase().endsWith('s') ? moduleName.slice(0, -1) : moduleName}s`,
                1,
                10,
              )
            }
            dispatch({ type: 'set', data: response.data.data })

            setVisible(false)
          }}
          handleClose={() => setVisible(false)}
        />
      </CContainer>
    </div>
  )


}


SingleSubHeader.propTypes = {
  handleFilter: PropTypes.any,
  selectedRow: PropTypes.any,
  moduleName: PropTypes.any.isRequired,
  deletionType: PropTypes.any,
}

export default SingleSubHeader
