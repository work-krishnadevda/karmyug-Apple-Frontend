import { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'

export const useCamera = () => {
  const webcamRef = useRef(null)
  const [image, setImage] = useState(null)
  const [cameraError, setCameraError] = useState('')
  const [cameraReady, setCameraReady] = useState(false)

  const requestCameraAccess = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('Your browser does not support camera access.')
      setCameraReady(false)
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })

      stream.getTracks().forEach((track) => track.stop())
      setCameraError('')
      setCameraReady(true)
      return true
    } catch (error) {
      setCameraReady(false)
      handleUserMediaError(error)
      return false
    }
  }, [])

  const capture = useCallback(() => {
    if (!webcamRef.current) {
      setCameraError('Camera is not ready yet. Please allow camera access and try again.')
      return null
    }

    const imageSrc = webcamRef.current.getScreenshot()

    if (!imageSrc) {
      setCameraError('Unable to capture image. Please check camera permission and try again.')
      return null
    }

    setCameraError('')
    setImage(imageSrc)
    return imageSrc
  }, [webcamRef])

  const handleUserMedia = useCallback(() => {
    setCameraError('')
    setCameraReady(true)
  }, [])

  const handleUserMediaError = useCallback((error) => {
    const errorName = error?.name || ''
    setCameraReady(false)

    if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
      setCameraError('Camera permission denied. Please allow camera access in your browser settings.')
      return
    }

    if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
      setCameraError('No camera device found on this system.')
      return
    }

    if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
      setCameraError('Camera is being used by another application. Please close it and try again.')
      return
    }

    if (errorName === 'SecurityError') {
      setCameraError('Camera access is blocked due to browser security. Use HTTPS or localhost.')
      return
    }

    setCameraError('Unable to access camera. Please check permission and device availability.')
  }, [])

  return {
    webcamRef,
    image,
    setImage,
    cameraError,
    cameraReady,
    setCameraError,
    requestCameraAccess,
    capture,
    WebcamComponent: () => (
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        width="100%"
        height={240}
        videoConstraints={{ facingMode: 'user' }}
        onUserMedia={handleUserMedia}
        onUserMediaError={handleUserMediaError}
        mirrored={true}
        playsInline
        style={{ borderRadius: '8px', width: '100%', height: '240px', objectFit: 'cover' }}
      />
    ),
  }
}
