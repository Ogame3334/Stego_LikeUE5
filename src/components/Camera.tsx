'use client'

import Webcam from "react-webcam";
import { useState, useEffect } from "react";

export default function CustomWebcam() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);

  const handleDevices = (mediaDevices: MediaDeviceInfo[]) => {
    const videoDevices = mediaDevices.filter(({ kind }) => kind === 'videoinput');
    setDevices(videoDevices);
    if (videoDevices.length > 0) {
      setDeviceId(videoDevices[0].deviceId);
    }
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, []);

  const videoConstraints = {
    width: 1280,
    height: 720,
    deviceId: deviceId
  };

  return (
    <>
      <Webcam
        audio={false}
        // height={720}
        screenshotFormat="image/jpeg"
        // width={1280}
        videoConstraints={videoConstraints}
      />
      <div>
        {devices.map((device, index) => (
          <>
            <button
              className="border border-black"
              key={device.deviceId} onClick={() => setDeviceId(device.deviceId)}
            >
              {device.label || `Camera ${index + 1}`}
            </button>
            <br/>
          </>
        ))}
      </div>
    </>
  )
}
