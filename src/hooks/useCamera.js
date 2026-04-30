import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

export const useCamera = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    return imageSrc;
  }, [webcamRef]);

  return {
    webcamRef,
    image,
    setImage,
    capture,
    WebcamComponent: () => (
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        width={250}
        height={180}
        videoConstraints={{ facingMode: "user" }}
        style={{ borderRadius: "8px" }}
      />
    ),
  };
};
