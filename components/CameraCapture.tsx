import React, { useRef, useEffect, useState, useCallback } from 'react';
import SwitchCameraIcon from './icons/SwitchCameraIcon';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
  
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async (deviceId: string) => {
    stopStream();
    try {
      const constraints = { video: { deviceId: { exact: deviceId } } };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setActiveDeviceId(deviceId);
      setError(null);
    } catch (err) {
        console.error("Error accessing camera:", err);
        let errorMessage = "Could not access the camera. Please check your browser permissions and ensure a camera is connected.";
        if (err instanceof DOMException) {
            if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                errorMessage = "No camera was found on your device. Please ensure one is connected and not in use by another application.";
            } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                errorMessage = "Camera access denied. Please grant permission in your browser's settings to use this feature.";
            }
        }
        setError(errorMessage);
    }
  }, [stopStream]);

  useEffect(() => {
    const setup = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(d => d.kind === 'videoinput');

            if (videoInputs.length === 0) {
                throw new DOMException("No camera was found on your device.", "NotFoundError");
            }
            
            setVideoDevices(videoInputs);

            const backCamera = videoInputs.find(d => /back|environment/i.test(d.label));
            const initialDeviceId = backCamera ? backCamera.deviceId : videoInputs[0].deviceId;
            
            if (initialDeviceId) {
                startStream(initialDeviceId);
            }

        } catch (err: any) {
             console.error("Error setting up camera devices:", err);
             let errorMessage = "Could not access camera devices. Please check your browser permissions.";
             if (err instanceof DOMException) {
                if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                    errorMessage = "No camera was found on your device. Please ensure one is connected and not in use by another application.";
                } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                    errorMessage = "Camera access denied. Please grant permission in your browser's settings to use this feature.";
                }
             }
             setError(errorMessage);
        }
    };
    setup();

    return () => {
      stopStream();
    };
  }, [startStream, stopStream]);

  const handleSwitchCamera = () => {
    if (videoDevices.length < 2 || !activeDeviceId) return;
    
    const currentIndex = videoDevices.findIndex(d => d.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    const nextDeviceId = videoDevices[nextIndex].deviceId;

    if (nextDeviceId) {
      startStream(nextDeviceId);
    }
  };

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

        {videoDevices.length > 1 && !error && (
            <button
                onClick={handleSwitchCamera}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Switch camera"
            >
                <SwitchCameraIcon />
            </button>
        )}
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
