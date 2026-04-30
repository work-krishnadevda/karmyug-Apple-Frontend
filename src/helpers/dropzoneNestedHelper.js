import { cilMenu, cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

class DropZoneNestedHelper {

  static onDrop(e, wrapperRef, setInitialValues, initialValues) {
    e.preventDefault()
    wrapperRef.current.classList.remove('dragover')

    const newFiles = e.dataTransfer ? Array.from(e.dataTransfer.files) : Array.from(e.target.files)
    const currentItemCount = initialValues.gallery.length

    const newContent = newFiles.map((file, index) => ({
      id: currentItemCount + index + 1,
      heading: '',
      sliderType: '',
      type_slug: '',
      link: '',
      description: '',
      file: file,
    }))

    setInitialValues((prevValues) => ({
      ...prevValues,
      gallery: [...prevValues.gallery, ...newFiles],
      content: [...(prevValues.content || []), ...newContent], // Ensure prevValues.content is initialized
    }))
  }

  static renderItem({ item }, onEditCallback, onDeleteCallback) {
    // console.log(item.id)
    return (
      <>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <CIcon icon={cilMenu} className="me-3"></CIcon>

            {item.file ? (
              item.file instanceof File && (
                <img
                  className="me-2"
                  src={URL.createObjectURL(item.file)} // Create a URL for the file
                  width={50}
                  height={50}
                  alt="Uploaded File"
                />
              )
            ) : item.image && item.image.filepath ? (
              <img
                className="me-2"
                src={process.env.REACT_APP_NODE_URL + '/' + item.image.filepath} // Create a URL for the file
                width={50}
                height={50}
                alt="Uploaded File"
              />
            ) : null}

            {item.heading}
          </div>
          <div className="list-actions">
            <CIcon icon={cilPencil} onClick={onEditCallback} className="me-3"></CIcon>
            <CIcon icon={cilTrash} onClick={() => onDeleteCallback(item.id || item._id)}></CIcon>
          </div>
        </div>
      </>
    )
  }
}

export default DropZoneNestedHelper
