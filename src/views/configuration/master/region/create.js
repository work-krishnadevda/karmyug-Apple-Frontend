import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import HelperFunction from 'src/helpers/HelperFunctions'
import { DeleteModal } from 'src/helpers/deleteModalHelper'
import 'jstree/dist/themes/default/style.css'
import $ from 'jquery'
import 'jstree'

import {
  CButton,
  CCol,
  CFormLabel,
  CRow,
  CCard,
  CCardHeader,
  CCardFooter,
  CCardBody,
  CFormTextarea,
  CContainer,
  CForm,
  CModal,
  CModalBody,
  CModalFooter,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import BasicProvider from 'src/constants/BasicProvider'
import trash from 'src/assets/images/trash.png'
import handleSubmitHelper from 'src/helpers/submitHelper'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import { mapDataForDropdown } from 'src/helpers/treeDropDownHelper'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import { cilSpreadsheet } from '@coreui/icons'

const validationRules = {
  name: {
    required: true,
    minLength: 3,
  },
  type: {
    required: true,
  },
}

var subHeaderItems = [
  {
    name: 'Create',
    link: '/master/regions',
    icon: cilSpreadsheet,
  },
]


export default function Createregions() {
  var { id } = useParams()
  const [userId, setuserId] = useState([])
  const [data, setData] = useState([])

  const [visible, setVisible] = useState(false)
  const [nodeIdToDelete, setNodeIdToDelete] = useState(null)
  const navigate = useNavigate()
  const [selectedParent, setSelectedParent] = useState('')
  const isEditMode = !!id
  const [selectedType, setSelectedType] = useState('')
  const dispatch = useDispatch()
  const [typeValues, setTypeValues] = useState([])
  const treeRef = useRef(null)

  const [initialValues, setInitialValues] = useState({
    name: '',
    parent: '',
    type: '',
  })

  useEffect(() => {
    dispatch({ type: 'set', validations: [] })
    fetchAllData()
    fetchSingleData()
  }, [navigate])

  useEffect(() => {
    setSelectedParent('')
    setSelectedType('')
    setInitialValues({
      name: '',
      parent: '',
      type: '',
    })
  }, [navigate])

  useEffect(() => {
    if (treeRef.current) {
      const $tree = $(treeRef.current)

      $tree.jstree({
        core: {
          data: data,
        },
        checkbox: {
          keep_selected_style: false,
        },
        plugins: ['table', 'checkbox'],
      })

      $tree.on('ready.jstree', () => {
        $tree.find('.jstree-node').each(function (e, data) {
          var nodeId = $(this).attr('id')

          // Get the jstree instance node ID
          if (!$(this).hasClass('trash-appended')) {
            var instanceNodeId = $tree.jstree().get_node(nodeId).original.value
            if (!$(`#${nodeId} .treetrash`).length) {
              $(this).append(
                `<span class="treetrash"  data-node-id="${instanceNodeId}"><img src=${trash} alt="Trash"></span>`,
              )
              $(this).addClass('trash-appended')
            }
          }
        })
      })
      $tree.on('after_open.jstree', () => {
        $tree.find('.jstree-node').each(function () {
          const nodeId = $(this).attr('id')
          if (!$(this).hasClass('trash-appended')) {
            var instanceNodeId = $tree.jstree().get_node(nodeId).original.value
            if (!$(`#${nodeId} .treetrash`).length) {
              $(this).append(
                `<span class="treetrash"  data-node-id="${instanceNodeId}"><img src=${trash} alt="Trash"></span>`,
              )
              $(this).addClass('trash-appended')
            }
          }
        })
      })

      // $tree.on('click', '.treetrash', handleTrashClick)
      $tree.on('click', '.treetrash', (e) => {
        const nodeId = $(e.currentTarget).data('node-id')
        setNodeIdToDelete(nodeId) // Set the nodeIdToDelete state
        setVisible(true) // Show the modal
      })

      $tree.on('select_node.jstree', (e, data) => {
        const selectedNodeValue = data.node.original.value // Get the value of the selected node
        //
        navigate(`/master/region/${selectedNodeValue}/edit`)

        // Do something with the selected node value
      })
    }

    return () => {
      if (treeRef.current) {
        $(treeRef.current).jstree('destroy')
      }
    }
  }, [data])

  const handleCancel = () => {
    navigate('/master/regions')
    setSelectedParent('')
    setSelectedType('')
    setInitialValues({
      name: '',
      parent: '',
      type: '',
    })
  }

  // const handleTrashClick = async (event) => {
  //   const nodeId = $(event.currentTarget).data('node-id')
  //   const nodeElement = $(event.target).closest('.jstree-node')
  //   nodeElement.remove()
  //   const response = await new BasicProvider(`cms/region/delete/${nodeId}`).deleteRequest()
  //   fetchAllData()
  // }


  const handleDeleteConfirm = async () => {
    try {
      await new BasicProvider(`cms/region/delete/${nodeIdToDelete}`).deleteRequest()
      setVisible(false) // Hide the modal
      fetchAllData()// Refresh the region
    } catch (error) {
      console.error(error)
    }
  }

  const fetchSingleData = async () => {
    try {
      if (isEditMode) {
        const response = await new BasicProvider(`cms/region/show/${id}`).getRequest()
        setSelectedType(response.data.type)
        setSelectedParent(response.data.parent ? response.data.parent._id : '')
        setInitialValues({ ...response.data })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchAllData = async () => {
    try {
      const response = await new BasicProvider('cms/region/tree/all').getRequest()
      function extractFields(node, level = null) {
        const result = []
        const modifiedName = '-'.repeat(level) + node.name
        result.push({ _id: node._id, name: modifiedName })

        for (const child of node.children) {
          result.push(...extractFields(child, level + 1))
        }
        return result
      }
      const extractedData = []
      response.data.forEach((obj) => {
        extractedData.push(...extractFields(obj))
      })
      setTypeValues([...extractedData])
      const data = await mapDataForDropdown(response.data)
      // dispatch({ type: 'set', data: data }) // setregionData(response.data.data)
      setData(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) {
        return
      }
      var response
      if (isEditMode) {
        response = await new BasicProvider(`cms/region/update/${id}`).patchRequest(initialValues)
      } else {
        response = await new BasicProvider(`cms/region/create`).postRequest(data)
      }
      setSelectedParent('')
      setSelectedType('')
      setInitialValues({
        name: '',
        parent: '',
        type: '',
      })
      setAlertTimeout(dispatch)
      fetchAllData()
    } catch (error) {
      console.log(error)
    }
  }

  const handleOnChange = (e) => {
    const { name, value } = e.target
    if (name === 'name' && !isEditMode) {
      const regions = value.split('\n').map((region) => region)
      setInitialValues({ ...initialValues, name: regions })
    } else {
      setInitialValues({ ...initialValues, [name]: value })
    }
  }




  return (
    <>
      <SingleSubHeader moduleName="Regions" subHeaderItems={subHeaderItems}
      />
      <CContainer fluid className="px-4">
        <CForm className="g-3 needs-validation" onSubmit={handleSubmit}>
          <CRow>
            <CCol md={4}>
              <CCard className="mb-4">
                <CCardHeader>Create Region</CCardHeader>
                <CCardBody>
                  <div className="my-2">
                    <CFormLabel>
                      Region Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormTextarea
                      placeholder="(should be one line each)"
                      name="name"
                      // value={initialValues.name ?? ''}
                      value={
                        Array.isArray(initialValues.name)
                          ? initialValues.name.join('\n')
                          : initialValues.name
                      }
                      id="validationCustom05"
                      rows={5}
                      onChange={handleOnChange}
                    />
                  </div>
                  <CFormLabel>
                    Type<span className="text-danger">*</span>
                  </CFormLabel>
                  <AppFormSelect
                    className="mb-3"
                    name="type"
                    value={selectedType}
                    aria-label="Default Country"
                    options={[
                      { label: 'Select type', value: '' },
                      { label: 'Country', value: 'country' },
                      { label: 'State', value: 'state' },
                      { label: 'City', value: 'city' },
                    ]}
                    onChange={(e) => {
                      setSelectedType(e.target.value)
                      handleOnChange(e)
                    }}
                  />

                  <CFormLabel>
                    Parent
                  </CFormLabel>
                  <AppFormSelect
                    className="mb-3"
                    name="parent"
                    aria-label="Default select example"
                    options={[
                      { label: 'Select Parent', value: '' },
                      ...typeValues.map((item) => ({ label: item.name, value: item._id })),
                    ]}
                    value={selectedParent}
                    onChange={(e) => {
                      setSelectedParent(e.target.value)
                      handleOnChange(e)
                    }}
                  />
                  <CCardFooter className="px-1">
                    {!isEditMode && (
                      <CButton
                        DeleteModal
                        variant="outline"
                        timeout={2000}
                        className="submit_btn"
                        type="submit"
                        value="submit"
                      >
                        Submit
                      </CButton>
                    )}

                    {isEditMode && (
                      <CButton
                        className="btn btn-secondary me-2 mt-2"
                        type="submit"
                        name="buttonClicked"
                        value="update"
                      >
                        Update
                      </CButton>
                    )}
                    {/* <span className="ms-2">or </span> */}
                    <CButton className="ms-3 text-light" color="danger" onClick={handleCancel}>
                      Cancel
                    </CButton>
                  </CCardFooter>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={8}>
              <CCard className="mb-4">
                <CCardHeader>Regions</CCardHeader>
                <CCardBody>
                  <div ref={treeRef}></div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CForm>
        <CModal visible={visible} onClose={() => setVisible(false)} alignment="center" className="delete_item_box">
          <CModalBody className="text-center mt-4">
            <div className="logo_x m-auto mb-3">x</div>
            <span>
              Are you sure you want to delete the Region?
            </span>
          </CModalBody>
          <CModalFooter className="model_footer justify-content-center mb-3 pt-0">
            <CButton className="delete_btn model_btn" color="danger" onClick={handleDeleteConfirm}>
              Yes
            </CButton>
            <CButton className="close_btn model_btn" color="secondary" onClick={() => setVisible(false)}>
              No, cancel
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>
    </>
  )
}
