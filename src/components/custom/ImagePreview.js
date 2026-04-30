import { cilAperture, cilImagePlus, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CFormLabel } from '@coreui/react'
import React, { useState } from 'react'
import MakeitProfessional from './popup/makeitprofessional'

import videoIcon from 'src/assets/images/video-icon.png'
import pdfIcon from 'src/assets/images/pdfIcon.png'
import docIcon from 'src/assets/images/docc.png'

function ImagePreview(props) {
  const { rowIndex = '', id, className, file, onDelete, isEdit, MakeitProfessionalimg } = props

  const [shomakeitProfs, setShoMakeitProfs] = useState(false)
  const closeMakeitProfsModel = () => setShoMakeitProfs(!shomakeitProfs)
  var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/

  let fileType = 'dsfd'

  if (file != null && file != '') {
    if (file && file?.type === 'application/pdf') {
      return (
        <div className={`d-flex ${className}`}>
          <div className={`d-inline-block position-relative preview_image`}>
            <img src={pdfIcon} className="mt-0 m-0" />
            <CIcon onClick={onDelete} icon={cilTrash} size="lg" className="remove_featured" />
          </div>
        </div>
      )
    } else if (
      file &&
      ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(
        file?.type,
      )
    ) {
      return (
        <div className={`d-flex ${className}`}>
          <div className={`d-inline-block position-relative preview_image`}>
            <img src={docIcon} className="mt-0 m-0" />
            <CIcon onClick={onDelete} icon={cilTrash} size="lg" className="remove_featured" />
          </div>
        </div>
      )
    } else if (
      file &&
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ].includes(file?.type)
    ) {
      return (
        <div className={`d-flex ${className}`}>
          <div className={`d-inline-block position-relative preview_image`}>
            <img src={'XL'} className="mt-0 m-0" />
            <CIcon onClick={onDelete} icon={cilTrash} size="lg" className="remove_featured" />
          </div>
        </div>
      )
    } else {
      return (
        <div id="previewBlock" className={` d-flex ${className}`}>
          <div className={`d-inline-block position-relative preview_image`}>
            <div id={id ? id : `previewImage${rowIndex}`}>
              {file && <img src={file} className="mt-0 m-0" />}
            </div>
            <CIcon onClick={onDelete} icon={cilTrash} size="lg" className="remove_featured" />
          </div>
        </div>
      )
    }
  }

  return <div></div>
}

export default ImagePreview
