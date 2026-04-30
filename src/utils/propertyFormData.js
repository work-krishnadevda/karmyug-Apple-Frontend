/**
 * Build multipart FormData for POST /api/properties/create.
 * Use when at least one attachment file is present; otherwise keep sending JSON from forms.
 * @param {File|File[]} attachmentFiles - single file or array (same field name "attachment" for multer)
 */
export function buildPropertyCreateFormData(submitData, attachmentFiles) {
  const fd = new FormData()
  Object.entries(submitData).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (typeof v === 'boolean') {
      fd.append(k, v ? 'true' : 'false')
      return
    }
    if (v instanceof Date) {
      fd.append(k, v.toISOString())
      return
    }
    fd.append(k, String(v))
  })
  const list = Array.isArray(attachmentFiles)
    ? attachmentFiles
    : attachmentFiles instanceof File
      ? [attachmentFiles]
      : []
  list.forEach((file) => {
    if (file instanceof File) {
      fd.append('attachment', file, file.name)
    }
  })
  return fd
}

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = /^image\/(jpeg|jpg|png|gif|webp)$/i

/** Before FE-style compression: only check MIME (large files are compressed next). */
export function validatePropertyAttachmentMimeOnly(file) {
  if (!file) return { ok: true }
  if (!ALLOWED.test(file.type || '')) {
    return { ok: false, message: 'Please choose a JPEG, PNG, GIF, or WebP image.' }
  }
  return { ok: true }
}

export function validatePropertyAttachmentFile(file) {
  if (!file) return { ok: true }
  if (!ALLOWED.test(file.type || '')) {
    return { ok: false, message: 'Please choose a JPEG, PNG, GIF, or WebP image.' }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: 'Image must be 5MB or smaller.' }
  }
  return { ok: true }
}
