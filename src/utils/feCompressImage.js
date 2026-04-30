/**
 * Same image compressor as Field Engineer visit upload (UploadFiles.js).
 * Targets ~maxSizeMB (default 1MB) for large photos; returns original if non-image or already small.
 *
 * @param {File} file
 * @param {number} [maxSizeMB=1]
 * @returns {Promise<File>}
 */
export function compressImage(file, maxSizeMB = 1) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size <= maxSizeBytes) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    const isPNG = file.type === 'image/png'
    const outputType = isPNG ? 'image/jpeg' : file.type
    const originalSize = file.size

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: false })
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        let width = img.width
        let height = img.height

        const sizeRanges = [
          { min: 5 * 1024 * 1024, maxDim: 900 },
          { min: 3 * 1024 * 1024, maxDim: 1100 },
          { min: 2 * 1024 * 1024, maxDim: 1200 },
          { min: 1.5 * 1024 * 1024, maxDim: 1300 },
        ]

        let maxDimension = 1400
        for (const range of sizeRanges) {
          if (originalSize > range.min) {
            maxDimension = range.maxDim
            break
          }
        }

        if (width > maxDimension || height > maxDimension) {
          const ratio = width > height ? maxDimension / width : maxDimension / height
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        if (originalSize > 5 * 1024 * 1024 && (width > 900 || height > 900)) {
          const scale = 0.75
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        } else if (originalSize > 3 * 1024 * 1024 && (width > 1000 || height > 1000)) {
          const scale = 0.8
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }

        let startQuality = 0.6
        if (originalSize > 5 * 1024 * 1024) startQuality = 0.35
        else if (originalSize > 3 * 1024 * 1024) startQuality = 0.45
        else if (originalSize > 2 * 1024 * 1024) startQuality = 0.5
        else if (originalSize > 1.5 * 1024 * 1024) startQuality = 0.55

        const compressRecursive = (currentWidth, currentHeight, quality, attempt = 0) => {
          return new Promise((resolveCompress) => {
            if (attempt > 20) {
              const finalWidth = Math.min(currentWidth, 600)
              const finalHeight = Math.min(currentHeight, 600)
              canvas.width = finalWidth
              canvas.height = finalHeight
              ctx.clearRect(0, 0, finalWidth, finalHeight)
              ctx.drawImage(img, 0, 0, finalWidth, finalHeight)

              const finalFileName = isPNG ? file.name.replace(/\.png$/i, '.jpg') : file.name
              canvas.toBlob(
                (blob) => {
                  resolveCompress(
                    blob
                      ? new File([blob], finalFileName, { type: outputType, lastModified: Date.now() })
                      : file,
                  )
                },
                outputType,
                0.2,
              )
              return
            }

            canvas.width = currentWidth
            canvas.height = currentHeight
            ctx.clearRect(0, 0, currentWidth, currentHeight)
            ctx.drawImage(img, 0, 0, currentWidth, currentHeight)

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  resolveCompress(file)
                  return
                }

                const targetSize = maxSizeBytes * 0.95
                if (blob.size <= targetSize) {
                  const fileName = isPNG ? file.name.replace(/\.png$/i, '.jpg') : file.name
                  resolveCompress(
                    new File([blob], fileName, { type: outputType, lastModified: Date.now() }),
                  )
                  return
                }

                if (currentWidth > 1200 || currentHeight > 1200) {
                  resolveCompress(
                    compressRecursive(
                      Math.round(currentWidth * 0.65),
                      Math.round(currentHeight * 0.65),
                      0.5,
                      attempt + 1,
                    ),
                  )
                } else if (quality > 0.3) {
                  resolveCompress(
                    compressRecursive(currentWidth, currentHeight, Math.max(0.3, quality - 0.2), attempt + 1),
                  )
                } else if (currentWidth > 1000 || currentHeight > 1000) {
                  resolveCompress(
                    compressRecursive(
                      Math.round(currentWidth * 0.7),
                      Math.round(currentHeight * 0.7),
                      0.4,
                      attempt + 1,
                    ),
                  )
                } else if (currentWidth > 800 || currentHeight > 800) {
                  resolveCompress(
                    compressRecursive(
                      Math.round(currentWidth * 0.75),
                      Math.round(currentHeight * 0.75),
                      0.35,
                      attempt + 1,
                    ),
                  )
                } else if (currentWidth > 600 || currentHeight > 600) {
                  resolveCompress(
                    compressRecursive(
                      Math.round(currentWidth * 0.8),
                      Math.round(currentHeight * 0.8),
                      0.3,
                      attempt + 1,
                    ),
                  )
                } else {
                  resolveCompress(
                    compressRecursive(
                      Math.max(500, Math.round(currentWidth * 0.85)),
                      Math.max(500, Math.round(currentHeight * 0.85)),
                      0.25,
                      attempt + 1,
                    ),
                  )
                }
              },
              outputType,
              quality,
            )
          })
        }

        compressRecursive(width, height, startQuality)
          .then((compressedFile) => {
            canvas.width = 0
            canvas.height = 0
            resolve(compressedFile || file)
          })
          .catch((error) => {
            canvas.width = 0
            canvas.height = 0
            console.error('Compression error:', error)
            resolve(file)
          })
      }

      img.onerror = () => resolve(file)
      img.src = e.target.result
    }

    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

/** Same threshold as FE visit: compress images larger than 1MB toward ~0.95MB */
export const FE_COMPRESS_THRESHOLD_BYTES = 1024 * 1024
export const FE_COMPRESS_TARGET_MB = 0.95
