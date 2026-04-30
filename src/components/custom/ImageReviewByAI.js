import { cilAperture, cilImagePlus, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CFormLabel } from '@coreui/react'
import React, { useState } from 'react'
import MakeitProfessional from './popup/makeitprofessional'
import axios from 'axios'
import BasicProvider from 'src/constants/BasicProvider'
import LoderGif from '../../assets/images/loading/LoadingGift.gif'

const URL = process.env.REACT_APP_NODE_URL

function AIImagePreview(props) {
  const {
    rowIndex = '',
    id,
    className,
    file,
    onDelete,
    isEdit,
    MakeitProfessionalimg,
    initialValues,
    setInitialValues,

  } = props



  const [bgRemovedfile, setBgRemovedfile] = useState(null)
  const [flag, setflag] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  
  // useState(() => {
  //   setflag(false)
  //   setBgRemovedfile(null)
  // }, [])

  
  const bgRemoverHandler = async () => {
    setIsLoading(true)
    let url = initialValues.featured_image?.filepath
    let fullUrl = `${URL}/${url}`

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_PYTHON_API_URL}/remove_background`,
        { image_file: fullUrl },
      )

      if (response) {
        try {
          const res = await fetch(response.data.image_url)
          const blob = await res.blob()
          const filename = 'downloaded_image.png'
          const downloadedFile = new File([blob], filename, { type: 'image/png' })
          // console.log('downloadedFile', downloadedFile)
          const formData = new FormData()
          formData.append('featured_image', downloadedFile)
          const responseimage = await new BasicProvider(`cms/files/create`).postRequest(formData)

          if (responseimage) {
            setflag(true)
            // setBgRemovedfile(responseimage?.data)
            setInitialValues((prev)=>({...prev ,featured_image:responseimage?.data}))

            setIsLoading(false)
          }
        } catch (error) {
          console.log('err', error)
        }
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  const [shomakeitProfs, setShoMakeitProfs] = useState(false)
  const closeMakeitProfsModel = () => setShoMakeitProfs(!shomakeitProfs)
  var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
  if (file != null && file != '') {
    return (
      <>
        {' '}
        <div id="previewBlock" className={` d-flex ${className}`}>
          {/* ghjgfhfhfh */}
          <div
            className={`d-inline-block position-relative ${
              MakeitProfessionalimg ? 'makeitprofessionalimg ' : 'preview_image'
            }`}
          >
            {/* <div id={MakeitProfessional ?  "makeitprofessional":id ? id : `previewImage${rowIndex}`}> */}
            <div>
              {initialValues.featured_image && flag ? (
                <>
                  {base64regex.test(initialValues.featured_image) === false && (
                    <img
                      src={
                        isLoading
                          ? LoderGif
                          : `${process.env.REACT_APP_NODE_URL}/${initialValues.featured_image?.filepath}`
                      }
                      className="mt-0 m-0"
                    />
                  )}
                </>
              ) : (
                <>
                  {isLoading ? (
                    <div>
                      <img src={LoderGif} className="mt-0 m-0" />
                    </div>
                  ) : (
                    <div id={id ? id : `previewImage${rowIndex}`}>
                      {base64regex.test(file) === false && (
                        <img
                          src={`${process.env.REACT_APP_NODE_URL}/${file}`}
                          className="mt-0 m-0"
                        />
                      )}
                    </div>
                  )}
                </>
                // <>
                //   {base64regex.test(file) === false && (
                //     <img src={`${process.env.REACT_APP_NODE_URL}/${file}`} className="mt-0 m-0" />
                //   )}

                // </>
              )}
            </div>
            <CIcon
              onClick={() => {
                onDelete(),
                setInitialValues({ ...initialValues, featured_image: null })

              }}
              icon={cilTrash}
              size="lg"
              className="remove_featured"
            />
          </div>
          <div className="ms-3">
            <div className="d-flex imgDesignbtn align-items-center mb-1">
              <CIcon icon={cilAperture} />
              <CFormLabel onClick={bgRemoverHandler} className="mx-1 imgDesignbtn">
                BG remover.
              </CFormLabel>
            </div>
            <div className="d-flex imgDesignbtn align-items-center">
              <CIcon icon={cilImagePlus} />
              <CFormLabel className="mx-1 imgDesignbtn" onClick={() => setShoMakeitProfs(true)}>
                Make it professional.
              </CFormLabel>
            </div>
          </div>
        </div>
        {/*below bg remover popup model */}
        <MakeitProfessional
          visible={shomakeitProfs}
          closeMakeitProfsModel={closeMakeitProfsModel}
        />
      </>
    )
  }

  return <div></div>
}

export default AIImagePreview
