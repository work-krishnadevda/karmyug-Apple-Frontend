import { cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import React, { forwardRef } from 'react';

const VariantPreview = forwardRef((props, ref) => {
  const { files, onDelete } = props;

  if (files && files.length > 0) {
    return (
      <div id="previewBlock" className={`d-flex flex-wrap`} ref={ref}>
        {files.map((file, index) => (
          <div key={index} className="multiple_images position-relative">
            <img src={file} alt={`Preview ${index}`} />
            <CIcon onClick={() => onDelete(index)} icon={cilTrash} size="lg" className="remove_featured" />
          </div>
        ))}
      </div>
    );
  }

  return <div></div>;
});

export default VariantPreview;
