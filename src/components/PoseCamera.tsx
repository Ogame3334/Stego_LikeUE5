import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as posenet from '@tensorflow-models/posenet';
import '@tensorflow/tfjs';
import Webcam from 'react-webcam';
import Image from 'next/image';

interface PoseNetComponentProp {
  pose: posenet.Pose;
  setPose: Function;
  setChangeCamera: Function
}

const PoseNetComponent: React.FC<PoseNetComponentProp> = (props: PoseNetComponentProp) => {
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [cameraList, setCameraList] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');


  const toggleCamera = async () => {
    console.log(selectedCamera);
    console.log(cameraList.length);
    const index = cameraList.map((elem) => (elem.deviceId)).indexOf(selectedCamera);
    console.log(index);

    // const newDeviceId = cameraList[index + 1].deviceId;
    
    // const stream = await navigator.mediaDevices.getUserMedia({
    //   video: { deviceId: { exact: newDeviceId } },
    // });
    // webcamRef.current.video.srcObject = stream;
    // setSelectedCamera(newDeviceId);
  }

  useEffect(() => {
    const loadPosenet = async () => {
      const net = await posenet.load();
      setLoading(false);
      const detect = async () => {
        if (
          webcamRef.current &&
          webcamRef.current.video.readyState === 4 &&
          canvasRef.current
        ) {
          const video = webcamRef.current.video;
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          webcamRef.current.video.width = videoWidth;
          webcamRef.current.video.height = videoHeight;

          const pose = await net.estimateSinglePose(video, {
            flipHorizontal: false,
          });

          props.setPose(pose);

          drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
        }
      };
      setInterval(detect, 100);
    };

    const getCameras = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === 'videoinput');
      setCameraList(cameras);
      if (cameras.length > 0) {
        setSelectedCamera(cameras[0].deviceId);
      }
    };

    loadPosenet();
    getCameras();
    // props.setChangeCamera(()=>{console.log("fuga")})
  }, []);

  const switchCamera = async (deviceId: string) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
    });
    webcamRef.current.video.srcObject = stream;
    setSelectedCamera(deviceId);
  };

  const drawCanvas = (
    pose: posenet.Pose,
    video: HTMLVideoElement,
    videoWidth: number,
    videoHeight: number,
    canvas: React.RefObject<HTMLCanvasElement>
  ) => {
    const ctx = canvas.current!.getContext('2d');
    canvas.current!.width = videoWidth;
    canvas.current!.height = videoHeight;

    ctx!.drawImage(video, 0, 0, videoWidth, videoHeight);

    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.5) {
        const { y, x } = keypoint.position;
        ctx!.beginPath();
        ctx!.arc(x, y, 5, 0, 2 * Math.PI);
        ctx!.fillStyle = 'red';
        ctx!.fill();
      }
    });
  };

  return (
    <div>
      {loading && <p>Loading PoseNet model...</p>}
      {/* <div>
        <select
          value={selectedCamera}
          onChange={(e) => switchCamera(e.target.value)}
        >
          {cameraList.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || `Camera ${camera.deviceId}`}
            </option>
          ))}
        </select>
      </div> */}
      <Webcam
        ref={webcamRef}
        // mirrored={true}
        style={{
          // visibility: 'hidden',
          width: 0,
          height: 0,
        }}
      />
      {/* <div>
        <button 
          className='absolute z-10'
          onClick={}
        >
          <Image 
            src="/toggle.png"
            width={50}
            height={50}
            alt="toggle"
            className='m-3'
          />
        </button>
      </div> */}
      <canvas
        ref={canvasRef}
        style={{
          zIndex: 8,
          width: '100%',
          height: '100%',
          borderRadius: 24,
          transform: 'scaleX(-1)'
        }}
      />
    </div>
  );
};

export default PoseNetComponent;
