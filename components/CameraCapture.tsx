import React, { useRef, useEffect, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        let errorMessage = "Could not access the camera. Please check your browser permissions and ensure a camera is connected.";
        if (err instanceof DOMException) {
            if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") { // DevicesNotFoundError for Firefox
                errorMessage = "No camera was found on your device. Please ensure one is connected and not in use by another application.";
            } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") { // PermissionDeniedError for Firefox
                errorMessage = "Camera access denied. Please grant permission in your browser's settings to use this feature.";
            }
        }
        setError(errorMessage);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col items-center justify-center">
      <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-lg">
        {error ? (
          <div className="p-8 text-white text-center">
            <p className="text-red-500">{error}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
              Close
            </button>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      {!error && (
        <div className="mt-4 flex space-x-4">
          <button onClick={handleCapture} className="px-6 py-3 bg-brand-green-600 text-white rounded-full font-semibold hover:bg-brand-green-700">
            Capture Photo
          </button>
          <button onClick={onClose} className="px-6 py-3 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-600">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
