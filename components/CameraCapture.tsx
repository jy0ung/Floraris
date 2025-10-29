import React, { useRef, useEffect, useState, useCallback } from 'react';
import SwitchCameraIcon from './icons/SwitchCameraIcon';
import FlashlightIcon from './icons/FlashlightIcon';

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

  const [torchSupported, setTorchSupported] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async (constraints: MediaStreamConstraints) => {
    stopStream();
    setIsTorchOn(false);
    setTorchSupported(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities();
        // @ts-ignore
        if (capabilities.torch) {
            setTorchSupported(true);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      setVideoDevices(videoInputs);
      const currentDeviceId = track?.getSettings().deviceId;
      setActiveDeviceId(currentDeviceId);

      setError(null);
    } catch (err) {
        console.error("Error accessing camera:", err);
        let errorMessage = "Could not access the camera. Please check your browser permissions and ensure a camera is connected.";
        if (err instanceof DOMException) {
            if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                errorMessage = "No camera was found on your device. Please ensure one is connected and not in use by another application.";
            } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                errorMessage = "Camera access denied. Please grant permission in your browser's settings to use this feature.";
            } else if (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError") {
                errorMessage = `The camera constraints could not be satisfied. This might be because the camera is already in use.`;
            }
        }
        setError(errorMessage);
    }
  }, [stopStream]);

  // This effect runs once on mount to get the camera stream.
  useEffect(() => {
    const initialConstraints = { video: { facingMode: { ideal: 'environment' } } };
    
    startStream(initialConstraints).catch(err => {
        console.warn("Could not get back camera, trying default", err);
        // Fallback to any camera if environment facing fails
        startStream({ video: true });
    });

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
      startStream({ video: { deviceId: { exact: nextDeviceId } } });
    }
  };

  const handleToggleTorch = async () => {
    if (!streamRef.current || !torchSupported) return;

    const track = streamRef.current.getVideoTracks()[0];
    try {
        // @ts-ignore - The `torch` property is not part of the standard MediaTrackConstraintSet type definition
        await track.applyConstraints({ advanced: [{ torch: !isTorchOn }] });
        setIsTorchOn(prev => !prev);
    } catch (err) {
        console.error("Failed to toggle torch:", err);
        setError("Could not toggle the flashlight.");
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
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col items-center justify-center p-4">
      <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-lg">
        {error ? (
          <div className="p-8 text-white text-center aspect-video flex flex-col justify-center items-center">
            <p className="text-red-500 font-semibold mb-2">Camera Error</p>
            <p className="text-sm">{error}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
              Close
            </button>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
        )}
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute top-4 right-4 flex flex-col gap-3">
            {videoDevices.length > 1 && !error && (
                <button
                    onClick={handleSwitchCamera}
                    className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Switch camera"
                >
                    <SwitchCameraIcon />
                </button>
            )}
             {torchSupported && !error && (
                <button
                    onClick={handleToggleTorch}
                    className={`p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors focus:outline-none focus:ring-2 focus:ring-white ${isTorchOn ? 'text-yellow-300' : 'text-white'}`}
                    aria-label="Toggle flashlight"
                >
                    <FlashlightIcon isOn={isTorchOn} />
                </button>
            )}
        </div>
      </div>
      {!error && (
        <div className="mt-4 flex items-center gap-4">
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