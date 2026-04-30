import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { cilSearch, cilList, cilCloudDownload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CRow,
  CSpinner,
} from '@coreui/react'

import { DeleteModal } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import { downloadFinalReportZip } from 'src/constants/common'

function SubHeader(props) {
  const {
    searchInput,
    onReset,
    handleFilter,
    moduleName,
    deletionType,
    subHeaderItems,
    setSearchCurrentPage,
    rowPerPage,
    defaultPage,
    isHideAddButton,
    isDirectDelete,
    idBuklBtn,
    isSearch = true
  } = props


  const [activeLink, setActiveLink] = useState('')
  const [visible, setVisible] = useState(false)
  const [search, setSearch] = useState(searchInput || '')
  const selectedRow = useSelector((state) => state.selectedrows)

  const params = useParams()
  const location = useLocation()
  const id = params.id

  let isFromAdmin = location.pathname.startsWith('/admins')

  let isFirFinance = location.pathname.startsWith('/bank')

  let isFromCases = location.pathname.startsWith('/case')

  const effectRef = useRef(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [caseData, setCaseData] = useState(null)
  const [zipLoading, setZipLoading] = useState(false)

  let loggedinUserRole = useSelector((state) => state?.userRole)

  useEffect(() => {
    if (subHeaderItems != null && subHeaderItems.length > 0) {
      dispatch({ type: 'set', selectedrows: [] })
      const currentLink = location.pathname
      const activeItem = props.subHeaderItems.find((item) => item.link === currentLink)
      setActiveLink(activeItem ? activeItem.name : props.subHeaderItems[0].name)
    }
    setSearch(searchInput)
  }, [location])

  const indexofCreate = subHeaderItems?.find((item) => item.link.includes('create'))
  const handleItemClick = (item, index) => {
    navigate(item.link)
  }

  const handleAddNew = () => {
    if (indexofCreate != undefined) {
      navigate(indexofCreate.link)
    }
  }

  useEffect(() => {
    if (effectRef.current === false) {
      effectRef.current = true
      fetchData(id)
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
    <>
      <div className="subheader-custom py-3 mb-4">
        <CRow xs={{ cols: 1, gutter: 2 }} lg={{ cols: 2, gutter: 3 }} className="px-3 w-100">
          <CCol>
            <div className="create-blog-button d-flex align-items-center">
              {props.subHeaderItems && (
                <div>
                  <CDropdown>
                    <CDropdownToggle
                      id="cdropdown-toggle"
                      className="dropdownmenu subheader_button_leftside"
                    >
                      {activeLink}
                    </CDropdownToggle>
                    <CDropdownMenu>
                      {props.subHeaderItems.map((item, index) => (
                        <CDropdownItem
                          key={index}
                          className="dropmenu_item_btn "
                          onClick={() => {
                            handleItemClick(item, index)
                          }}
                        >
                          <CIcon icon={item.icon} className="mx-2" />
                          {item.name}
                        </CDropdownItem>
                      ))}
                    </CDropdownMenu>
                  </CDropdown>
                  <span className="border-left"></span>
                </div>
              )}

              {Array.isArray(selectedRow) && selectedRow.length > 0 ? (
                <>
                  <span className="selected_row">{selectedRow.length} selected:</span>
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
                <>
                  {!isHideAddButton ? (
                    <CButton className="add_new w-lg-25" onClick={handleAddNew}>
                      Add New
                    </CButton>
                  ) : (
                    ''
                  )}
                </>
              )}

              {idBuklBtn ? (
                <CButton
                  className="add_new w-lg-30 mx-2"
                  onClick={() => navigate('/case/bulk-upload')}
                >
                  Bulk Upload
                </CButton>
              ) : (
                ''
              )}
            </div>
          </CCol>

          {isSearch && (
            <CCol className="d-flex justify-content-end flex-column flex-sm-row align-items-center">
              {(isFromAdmin || isFirFinance) && (
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

              {loggedinUserRole.name !== process.env.REACT_APP_FE && id && isFromCases && caseData && caseData?.status === 'submitted to bank' && (
                <CButton
                  // color="warning"
                  className="add_new ms-2 ms-3 "
                  onClick={() => downloadFinalReportZip(caseData, setZipLoading, dispatch)}
                // disabled={zipLoading}
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
          )}
        </CRow>

        <DeleteModal
          visible={visible}
          setVisible={setVisible}
          userId={selectedRow}
          deletionType={deletionType}
          handleClose={() => setVisible(false)}
          moduleName={moduleName}
          currentPage={defaultPage}
          rowPerPage={rowPerPage}
          isDirectDelete={isDirectDelete}
        />
      </div>
    </>
  )
}

export default SubHeader
