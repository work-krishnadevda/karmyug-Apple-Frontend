import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSwitch,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CRow,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import $ from 'jquery'
import 'jstree'
import 'jstree/dist/themes/default/style.css'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import ImagePreview from 'src/components/custom/ImagePreview'
//   import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import BasicProvider from 'src/constants/BasicProvider'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import { ImageHelper } from 'src/helpers/imageHelper'
import { extractNamesFromTree, fetchCategories } from 'src/helpers/jsTreeHelper'
import handleSubmitHelper from 'src/helpers/submitHelper'
import trash from 'src/assets/images/trash.png'
import HelperFunction from 'src/helpers/HelperFunctions'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import { cilSpreadsheet } from '@coreui/icons'
import { DeleteModal } from 'src/helpers/deleteModalHelper'

const validationRules = {
  name: {
    required: true,
    minLength: 2,
  },
  type: {
    required: true,
  },
}

var subHeaderItems = [
  {
    name: 'Create',
    link: '/master/category',
    icon: cilSpreadsheet,
  },
]

export default function CreateCategories() {
  const [categoryTrees, setCategoryTrees] = useState([])
  const [dropDownData, setDropDownData] = useState([])
  const [otherSelected, setOtherSelected] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const [treeNames, setTreeNames] = useState([]) // Added state for tree names
  const [selectedType, setSelectedType] = useState('')
  const [selectedParent, setSelectedParent] = useState('')
  const [treeInstances, setTreeInstances] = useState([]) // Added state for jstree instances
  const dispatch = useDispatch()
  const featureImageInputRef = useRef(null)
  const navigate = useNavigate()
  const params = useParams()
  const id = params.id
  const isEditMode = !!id
  const fileInputRef = useRef(null)

  // const [visible, setVisible] = useState(false)
  // const [userId, setuserId] = useState([])
  // const [currentPage, setCurrentPage] = useState(1)
  // const [rowPerPage, setRowPerPage] = useState(null)

  const [visible, setVisible] = useState(false)
  const [nodeIdToDelete, setNodeIdToDelete] = useState(null)

  const [initialValues, setInitialValues] = useState({
    name: '',
    type: '',
    parent: '',
    featured_image: '',
    featured: 'false',
  })

  useEffect(() => {
    setSelectedType('')
    setSelectedParent('')
    setInitialValues({
      name: '',
      type: '',
      parent: '',
      featured_image: '',
    })
    setShowImage(false)
  }, [navigate])

  // console.log('INITTT',initialValues);

  useEffect(() => {
    if (isEditMode) {
      const fetchData = async () => {
        try {
          const response = await new BasicProvider(`cms/categories/show/${id}`).getRequest()
          const data = response.data
          setInitialValues({ ...data, parent: data?.parent?._id })
          setSelectedType(data.type) // Set the value of "type" property to selectedType
          setSelectedParent(data.parent ? data.parent._id : '')
          setShowImage(data.featured_image ? true : false)

          const newdata = await fetchCategories({ type: data.type })
          const tree = Object.values(newdata)
          const names = extractNamesFromTree(tree[0])
          setDropDownData(names)
        } catch (error) {
          console.error(error)
        }
      }
      fetchData()
    }
    getCategories()
  }, [navigate])

  useEffect(() => {
    categoryTrees.forEach((categoryTree, index) => {
      const treeInstance = treeInstances[index]
      if (treeInstance) {
        // Destroy existing tree instance before creating a new one
        $(`#jstree-${index}`).jstree('destroy')
      }

      const newTreeInstance = $(`#jstree-${index}`).jstree({
        core: {
          data: categoryTree,
        },
        checkbox: {
          keep_selected_style: false,
        },
        plugins: ['table', 'checkbox'],
      })
      // Add delete icon for every node
      $(`#jstree-${index}`).on('ready.jstree', function (e, data) {
        $('.jstree-node').each(function () {
          var nodeId
          // Check if a trash icon already exists
          if (!$(this).hasClass('trash-appended')) {
            if (data.instance.get_node(this).original != undefined) {
              nodeId = data.instance.get_node(this).original.value
            } else {
              nodeId = ''
            }
            if (nodeId && $(this).children('.treetrash').length === 0) {
              $(this).append(
                ` <span class="treetrash" data-index="${index}" data-node-id="${nodeId}"> <img src=${trash} ></span>`,
              )
              $(this).addClass('trash-appended')
            }
          }
        })
      })

      // Add delete icon for every node when open list
      $(`#jstree-${index}`).on('after_open.jstree', function (e, data) {
        $('.jstree-node').each(function () {
          var nodeId
          // //console.log(data.instance.get_node(this).original)
          if (!$(this).hasClass('trash-appended')) {
            if (data.instance.get_node(this).original != undefined) {
              nodeId = data.instance.get_node(this).original.value
            } else {
              nodeId = ''
            }
            if ($(this).children('.treetrash').length == 0) {
              $(this).append(
                `<span class="treetrash" data-index="${index}" data-node-id="${nodeId}"> <img  src=${trash}></span>`,
              )
              // Add a class to indicate that a trash icon has been appended
              $(this).addClass('trash-appended')
            }
          }
        })
      })

      //for delete any node from jstree
      // $(`#jstree-${index}`).on('click', '.treetrash', handleTrashClick)

      $(`#jstree-${index}`).on('click', '.treetrash', (e) => {
        const nodeId = $(e.currentTarget).data('node-id')
        setNodeIdToDelete(nodeId) // Set the nodeIdToDelete state
        setVisible(true) // Show the modal
      })

      // Add event listener for node click
      newTreeInstance.on('select_node.jstree', (e, data) => {
        const selectedNodeValue = data.node.original.value // Get the value of the selected node
        // //console.log(selectedNodeValue)
        setOtherSelected(false)
        // navigate('/cms/categories/edit', { state: { id: selectedNodeValue } })
        navigate(`/master/category/${selectedNodeValue}/edit`)

        // Do something with the selected node value
      })

      setTreeInstances((prevInstances) => [...prevInstances, newTreeInstance])
    })

    return () => {
      treeInstances.forEach((treeInstance) => {
        if (treeInstance) {
          $(treeInstance).jstree('destroy')
        }
      })
    }
  }, [categoryTrees])

  // const handleTrashClick = async (event) => {
  //   const clickedIndex = $(event.currentTarget).data('index')
  //   const nodeId = $(event.currentTarget).data('node-id')
  //   const nodeElement = $(event.target).closest('.jstree-node')
  //   nodeElement.remove()
  //   const response = await new BasicProvider(`cms/categories/delete/${nodeId}`).deleteRequest()
  //   getCategories()
  //   // console.log(response)
  // }

  const getCategories = async () => {
    try {
      const data = await fetchCategories({ type: 'all' })
      const keys = Object.keys(data)

      setTreeNames(keys)
      const trees = Object.values(data).map((categoryTree) => categoryTree)
      setCategoryTrees(trees)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // return
    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) {
        return
      }
      if (isEditMode) {
        const response = await new BasicProvider(`cms/categories/update/${id}`).patchRequest(data)
        //console.log(response)
      } else {
        const response = await new BasicProvider(`cms/categories/create`).postRequest(data)
        // console.log( "RESS",response)
        // navigate(`/master/category/${response.data[0]?._id}/edit`)
        setInitialValues({
          name: '',
          type: '',
          parent: '',
          featured_image: '',
        })
        setSelectedType('')
        setSelectedParent('')
      }
      setAlertTimeout(dispatch)
      getCategories()
    } catch (error) {
      console.log(error)
    }
  }

  const handleOnChange = (e) => {
    const { name, value } = e.target
    if (name === 'name' && !isEditMode) {
      const categoriesArray = value.split('\n').map((category) => category)
      setInitialValues((prevValues) => ({ ...prevValues, name: categoriesArray }))
    } else {
      setInitialValues((prevValues) => ({ ...prevValues, [name]: value }))
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await new BasicProvider(`cms/categories/delete/${nodeIdToDelete}`).deleteRequest()
      setVisible(false) // Hide the modal
      getCategories() // Refresh the categories
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <>
      <SingleSubHeader subHeaderItems={subHeaderItems} moduleName="Categories" />
      <CContainer fluid className="px-4 mt-4">
        <CForm className="g-3 needs-validation" onSubmit={handleSubmit}>
          <CRow>
            <CCol md={6}>
              <CCard className="mb-4">
                <CCardHeader>Create Category</CCardHeader>
                <CCardBody>
                  <div className="my-2">
                    <CFormLabel className="mb-2">
                      Category Name<span className="text-danger">*</span>
                      <span> (one per line)</span>
                    </CFormLabel>
                    <CFormTextarea
                      name="name"
                      onChange={handleOnChange}
                      value={
                        Array.isArray(initialValues.name)
                          ? initialValues.name.join('\n')
                          : initialValues.name
                      }
                      id="validationCustom05"
                      rows={5}
                    />
                  </div>
                  <CFormLabel>
                    Type<span className="text-danger">*</span>
                  </CFormLabel>
                  <AppFormSelect
                    className="mb-3"
                    name="type"
                    onChange={async (event) => {
                      const { value, name } = event.target
                      setInitialValues((prevValues) => ({
                        ...prevValues,
                        parent: '',
                      }))
                      setSelectedType(value)
                      if (value === 'other') {
                        setOtherSelected(true)
                      } else {
                        {
                          setOtherSelected(false)
                          handleOnChange(event)
                          const response = await fetchCategories({ type: value })
                          const tree = Object.values(response)
                          const names = extractNamesFromTree(tree[0])
                          setDropDownData(names)
                        }
                      }
                    }}
                    value={selectedType}
                    aria-label="Default select Type"
                    options={[
                      { label: 'Select Type', value: '' },
                      ...treeNames.map((name) => ({ label: name, value: name })),
                      { label: 'Other', value: 'other' },
                    ]}
                  />
                  {otherSelected && (
                    <div className="mb-3">
                      <CFormLabel>
                        Other Type<span className="text-danger">*</span>
                      </CFormLabel>
                      <CFormInput
                        type="text"
                        name="type"
                        onChange={handleOnChange}
                        id="validationCustom03"
                        placeholder="Other Type"
                      />
                    </div>
                  )}
                  <CFormLabel>Parent</CFormLabel>
                  <AppFormSelect
                    className="mb-3"
                    name="parent"
                    aria-label="Default select example"
                    options={[
                      { label: 'Select parent', value: '' },
                      ...dropDownData.map((name) => ({ label: name[1], value: name[0] })),
                    ]}
                    value={selectedParent}
                    onChange={(event) => {
                      const { value, name } = event.target
                      setSelectedParent(value)
                      handleOnChange(event)
                    }}
                  />
                  <CFormCheck
                    name="featured"
                    onChange={() => {
                      setInitialValues((prevValues) => ({
                        ...prevValues,
                        featured: prevValues.featured === 'true' ? 'false' : 'true',
                      }))
                    }}
                    checked={initialValues.featured === 'true'}
                  />
                  Featured Category
                  {/* <CCard className="my-3">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                      <div>Image Details</div>
                      <CFormSwitch
                        size="lg"
                        id=""
                        checked={showImage}
                        onChange={() => setShowImage(!showImage)}
                        className="switch-icon custome_switch_icon"
                      />
                    </CCardHeader>
                    {showImage && (
                      <CCardBody>
                        <CFormLabel>
                          Feature Image<span className="text-danger">*</span>
                        </CFormLabel>
                        <div className="inputBlock">
                          <CFormInput
                            id="image"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => {
                              const file = ImageHelper(e, 'previewImage')
                              setInitialValues({ ...initialValues, featured_image: file[0] })
                            }}
                          />
                          <ImagePreview
                            file={
                              initialValues.featured_image?.filepath
                                ? initialValues.featured_image.filepath
                                : initialValues.featured_image
                            }
                            onDelete={() => {
                              fileInputRef.current.value = ''
                              setInitialValues({ ...initialValues, featured_image: null })
                            }}
                          />
                        </div>
                      </CCardBody>
                    )}
                  </CCard> */}
                  <CCardFooter className="pt-3 mt-3">
                    {!isEditMode && (
                      <CButton className="submit_btn" type="submit">
                        Submit
                      </CButton>
                    )}
                    {isEditMode && (
                      <CButton className="update_btn" type="submit">
                        Update
                      </CButton>
                    )}
                    <span className="mx-2">or</span>
                    <CButton
                      className="btn btn-danger  text-light"
                      onClick={() => {
                        setSelectedType('')
                        setSelectedParent('')
                        setInitialValues({
                          name: '',
                          type: '',
                          parent: '',
                          featured_image: '',
                        })
                        setShowImage(false)
                        navigate('/master/category')
                      }}
                    >
                      Cancel
                    </CButton>
                  </CCardFooter>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CRow>
                {categoryTrees.map((categoryTree, index) => (
                  <CCol md={12} key={index}>
                    <CCard className="mb-4">
                      <CCardHeader>{treeNames[index]}</CCardHeader>
                      <CCardBody>
                        <div id={`jstree-${index}`}></div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
            </CCol>
          </CRow>
        </CForm>
      </CContainer>
      <CModal visible={visible} onClose={() => setVisible(false)} alignment="center" className="delete_item_box">
        <CModalBody className="text-center mt-4">
          <div className="logo_x m-auto mb-3">x</div>
          <span>
            Are you sure you want to delete the category?
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
    </>
  )
}
