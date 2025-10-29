import React, { useRef, useEffect, useState, useCallback } from 'react';
import SwitchCameraIcon from './icons/SwitchCameraIcon';
import FlashlightIcon from './icons/FlashlightIcon';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

const resolutions = [
    { label: '480p', width: 640, height: 480 },
    { label: '720p', width: 1280, height: 720 },
    { label: '1080p', width: 1920, height: 1080 },
];

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
  const [selectedResolution, setSelectedResolution] = useState(resolutions[1]); // Default to 720p

  const [torchSupported, setTorchSupported] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async (deviceId: string, resolution: { label: string, width: number; height: number; }) => {
    stopStream();
    setIsTorchOn(false);
    setTorchSupported(false);
    try {
      const constraints = { 
        video: { 
          deviceId: { exact: deviceId },
          width: { ideal: resolution.width },
          height: { ideal: resolution.height },
        } 
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities();
        
        // @ts-ignore - focusMode is not in all standard type definitions but is widely supported
        if (capabilities.focusMode?.includes('continuous')) {
            // @ts-ignore
            await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
        }
        
        // @ts-ignore
        if (capabilities.torch) {
            setTorchSupported(true);
        }
      }

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
            } else if (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError") {
                errorMessage = `The selected resolution (${resolution.label}) is not supported by your camera. Please try a lower resolution.`;
            }
        }
        setError(errorMessage);
    }
  }, [stopStream]);

  useEffect(() => {
    const setup = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true }); // Request permission
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(d => d.kind === 'videoinput');

            if (videoInputs.length === 0) {
                throw new DOMException("No camera was found on your device.", "NotFoundError");
            }
            
            setVideoDevices(videoInputs);

            const backCamera = videoInputs.find(d => /back|environment/i.test(d.label));
            const initialDeviceId = backCamera ? backCamera.deviceId : videoInputs[0].deviceId;
            
            if (initialDeviceId) {
                setActiveDeviceId(initialDeviceId);
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
  }, [stopStream]);

  useEffect(() => {
    if (activeDeviceId) {
        startStream(activeDeviceId, selectedResolution);
    }
  }, [activeDeviceId, selectedResolution, startStream]);


  const handleSwitchCamera = () => {
    if (videoDevices.length < 2 || !activeDeviceId) return;
    
    const currentIndex = videoDevices.findIndex(d => d.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    const nextDeviceId = videoDevices[nextIndex].deviceId;

    if (nextDeviceId) {
      setActiveDeviceId(nextDeviceId);
    }
  };

  const handleToggleTorch = async () => {
    if (!streamRef.current || !torchSupported) return;

    const track = streamRef.current.getVideoTracks()[0];
    try {
        // FIX: The `torch` property is not part of the standard MediaTrackConstraintSet type definition,
        // so we use @ts-ignore to bypass the TypeScript type check for this widely supported feature.
        // @ts-ignore
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

  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newResolution = resolutions.find(r => r.label === e.target.value);
    if (newResolution) {
        setSelectedResolution(newResolution);
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
      {!error ? (
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
                <label htmlFor="resolution-select" className="text-white text-sm font-medium">Resolution:</label>
                <select 
                    id="resolution-select"
                    value={selectedResolution.label}
                    onChange={handleResolutionChange}
                    className="bg-gray-700 text-white border-gray-600 rounded-md py-1 px-2 text-sm focus:ring-brand-green-500 focus:border-brand-green-500"
                >
                    {resolutions.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
                </select>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={handleCapture} className="px-6 py-3 bg-brand-green-600 text-white rounded-full font-semibold hover:bg-brand-green-700">
                    Capture Photo
                </button>
                <button onClick={onClose} className="px-6 py-3 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-600">
                    Cancel
                </button>
            </div>
        </div>
      ) : (
        <div className="mt-4">
            <div className="flex items-center gap-2">
                <label htmlFor="resolution-select" className="text-white text-sm font-medium">Try Resolution:</label>
                <select
                    id="resolution-select"
                    value={selectedResolution.label}
                    onChange={handleResolutionChange}
                    className="bg-gray-700 text-white border-gray-600 rounded-md py-1 px-2 text-sm focus:ring-brand-green-500 focus:border-brand-green-500"
                >
                    {resolutions.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
                </select>
            </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;