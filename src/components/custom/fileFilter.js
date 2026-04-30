import React, { useRef } from 'react'
import { cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
} from '@coreui/react'


import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { ImageHelper } from 'src/helpers/imageHelper'
import BasicProvider from 'src/constants/BasicProvider'
import ImagePreview from './ImagePreview'

const FileFilter = (props) => {
  const {
    searchInput,
    onReset,
    handleFilter,
    deletionType,
    setSearchCurrentPage,
    rowPerPage,
    defaultPage,
    initialValues,
    setInitialValues,
    handleFileOnChanege,
  } = props

  const fileInputRef = useRef(null)
  const [activeInput, setActiveInput] = useState('')
  const [searchError, setSearchError] = useState('')

  const clearFileName = () => {
    setInitialValues({ ...initialValues, featured_image: null })
    if (fileInputRef.current) {
      fileInputRef.current.value = null
    }
    const inputFile = document.getElementById('image')
    if (inputFile) {
      inputFile.value = null
    }
  }
  const validateSearch = (value) => {
    if (!value.trim()) {
      setSearchError('Search field cannot be empty!')
    } else {
      setSearchError('')
    }
  }

  
  return (
    <>
      <CCard>
        <CCardHeader>AI Filter</CCardHeader>
        <CCardBody>
          <CForm>
            <CRow className="align-items-center">
              <CCol md={5}>
                <CFormLabel>Search By Image</CFormLabel>
                <CFormInput
                  id="image"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    handleFileOnChanege(e)
                    setActiveInput('image')
                  }}
                  disabled={activeInput === 'name'}
                />
                {activeInput === 'name' && <small className='text-danger'>You can use one input at a time, hit Reset!</small>}

              </CCol>

              <CCol md={5} className="align-items-center">
                <CFormLabel htmlFor="Search">Search by Name</CFormLabel>
                <CFormInput
                  className="search_bar_box"
                  placeholder="Search"
                  type="text"
                  value={initialValues.search}
                  onChange={(event) => {
                    setInitialValues({ ...initialValues, search: event.target.value })
                    setActiveInput('name')
                    validateSearch(event.target.value)
                  }}
                  disabled={activeInput === 'image'}
                />
                {searchError && <p className="invalid-feedback">{searchError}</p>}
                {activeInput === 'image' && <small className='text-danger'>You can use one input at a time, hit Reset!</small>}

              </CCol>

              <CCol md={1}>
                <div className="d-flex mt-2 align-items-center">
                  <CButton
                    color="primary "
                    className=" ms-2 px-2 submit_btn  Filter-user-btn"
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault()
                      setSearchCurrentPage(initialValues.search)
                      handleFilter(initialValues.search)
                    }}
                  >
                    Filter
                  </CButton>
                  <CButton
                    color="danger"
                    onClick={() => {
                      onReset()
                      clearFileName()
                      setInitialValues({
                        search: '',
                        featured_image: '',
                      })
                      setActiveInput('')
                    }}
                    className=" ms-2 px-2 Filter-user-btn"
                    style={{ color: 'white' }}
                  >
                    Reset
                  </CButton>
                </div>
              </CCol>
            </CRow>
            <CRow>
              <ImagePreview
                file={
                  initialValues.featured_image?.filepath
                    ? initialValues.featured_image.filepath
                    : initialValues.featured_image
                }
                onDelete={() => {
                  fileInputRef.current.value = ''
                  setInitialValues({ ...initialValues, featured_image: null })
                  onReset()
                }}
              />
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}

export default FileFilter
