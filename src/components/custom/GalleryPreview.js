import { cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import React, { forwardRef } from 'react'

const GalleryPreview = forwardRef((props, ref) => {
    const { files, onDelete, isEdit } = props
    var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/

    if (files != null && files !== '') {
        return (
            <div id="previewBlock" className={`d-flex flex-wrap`} ref={ref}>
                {files.map((file, index) => (
                    <div key={index} className="multiple_images position-relative">
                        {file['filepath'] != null ? (
                            <img src={`${process.env.REACT_APP_NODE_URL}/${file['filepath']}`} alt={`Preview ${index}`} />
                        ) : (
                            <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
                        )}
                        <CIcon
                            onClick={() => onDelete(index)}
                            icon={cilTrash}
                            size="lg"
                            className="remove_featured"
                        />
                    </div>
                ))}
            </div>
        )
    }

    return <div></div>
})

export default GalleryPreview


