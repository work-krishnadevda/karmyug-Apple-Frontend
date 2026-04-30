import React, { useEffect, useId, useState } from 'react'
import { CButton, CCol, CFormInput, CFormLabel, CRow, CSpinner } from '@coreui/react'
import {
  compressImage,
  FE_COMPRESS_TARGET_MB,
  FE_COMPRESS_THRESHOLD_BYTES,
} from 'src/utils/feCompressImage'
import {
  validatePropertyAttachmentFile,
  validatePropertyAttachmentMimeOnly,
} from 'src/utils/propertyFormData'

const DEFAULT_MAX = 15
/** Max size before compression (phone camera RAW-style); larger files rejected to protect browser */
const MAX_RAW_BYTES = 40 * 1024 * 1024

/** Multiple images + thumbnails; large files compressed before upload (see feCompressImage). */
const ForcePinAttachmentField = ({
  files,
  onFilesChange,
  maxFiles = DEFAULT_MAX,
  label = 'Attachments',
  /** When false, render inner block only — wrap in your own <CCol> for grid alignment */
  wrapInCol = true,
  /** Label above input (better inside narrow md={3|4} columns) */
  compact = false,
}) => {
  const inputId = useId()
  const [previewUrls, setPreviewUrls] = useState([])
  const [isCompressing, setIsCompressing] = useState(false)

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviewUrls(urls)
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [files])

  const handleInput = async (e) => {
    const selected = Array.from(e.target.files || [])
    e.target.value = ''
    if (!selected.length) return

    setIsCompressing(true)
    try {
      const next = [...files]
      for (const f of selected) {
        const mimeCheck = validatePropertyAttachmentMimeOnly(f)
        if (!mimeCheck.ok) {
          window.alert(mimeCheck.message)
          continue
        }
        if (f.size > MAX_RAW_BYTES) {
          window.alert(
            `File "${f.name}" is too large before compression (max ${Math.round(MAX_RAW_BYTES / 1024 / 1024)}MB). Choose a smaller image.`,
          )
          continue
        }
        if (next.length >= maxFiles) {
          window.alert(`You can add at most ${maxFiles} images.`)
          break
        }

        let fileToAdd = f
        if (f.type.startsWith('image/') && f.size > FE_COMPRESS_THRESHOLD_BYTES) {
          try {
            fileToAdd = await compressImage(f, FE_COMPRESS_TARGET_MB)
          } catch (err) {
            console.error('Force pin image compression failed:', err)
            fileToAdd = f
          }
        }

        const finalCheck = validatePropertyAttachmentFile(fileToAdd)
        if (!finalCheck.ok) {
          window.alert(finalCheck.message)
          continue
        }
        next.push(fileToAdd)
      }
      onFilesChange(next)
    } finally {
      setIsCompressing(false)
    }
  }

  const removeAt = (index) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  const inner = (
    <div className={compact ? 'mb-0' : 'mb-2'}>
        <div
          className={
            compact
              ? 'd-flex flex-column align-items-stretch gap-1'
              : 'd-flex flex-wrap align-items-center gap-2'
          }
        >
          <CFormLabel
            htmlFor={inputId}
            className={
              compact
                ? 'mb-0 small fw-semibold text-body-secondary'
                : 'mb-0 small fw-semibold text-body-secondary flex-shrink-0'
            }
          >
            {label}
          </CFormLabel>
          <CFormInput
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            size="sm"
            className="form-control-sm"
            style={
              compact
                ? { width: '100%', maxWidth: '100%' }
                : { flex: '1 1 160px', minWidth: 120, maxWidth: '100%' }
            }
            disabled={isCompressing}
            onChange={handleInput}
            title={`JPEG, PNG, GIF, WebP · max ${maxFiles} files · 5MB each after compression`}
          />
        </div>
        {isCompressing && (
          <div
            className="d-flex align-items-center gap-1 mt-1 text-primary"
            style={{ fontSize: '0.75rem' }}
          >
            <CSpinner size="sm" />
            Compressing…
          </div>
        )}
        {files.length > 0 && (
          <CRow className="g-1 mt-2">
            {files.map((file, index) => (
              <CCol key={`${file.name}-${index}-${file.size}`} xs={4} sm={3} md={2} className="position-relative">
                <div
                  className="border rounded overflow-hidden bg-light"
                  style={{ aspectRatio: '1', maxHeight: 72 }}
                >
                  <img
                    src={previewUrls[index] || ''}
                    alt={file.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <CButton
                  type="button"
                  color="danger"
                  variant="ghost"
                  size="sm"
                  className="position-absolute top-0 end-0 p-0 px-1"
                  style={{ lineHeight: 1, minWidth: 'auto' }}
                  onClick={() => removeAt(index)}
                  title="Remove"
                >
                  ×
                </CButton>
                <div className="text-truncate" style={{ fontSize: '0.7rem' }} title={file.name}>
                  {file.name}
                </div>
              </CCol>
            ))}
          </CRow>
        )}
    </div>
  )

  if (!wrapInCol) return inner
  return <CCol md={12}>{inner}</CCol>
}

export default ForcePinAttachmentField
