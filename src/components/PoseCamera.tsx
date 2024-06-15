import React, { useRef, useEffect, useState } from 'react';
import * as posenet from '@tensorflow-models/posenet';
import '@tensorflow/tfjs';
import Webcam from 'react-webcam';
import RoundedButtonOnClick from './RoundedButtonOnClick';

interface PoseNetComponentProp {
  pose: posenet.Pose;
  setPose: Function;
}

const PoseNetComponent: React.FC<PoseNetComponentProp> = (props: PoseNetComponentProp) => {
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [cameraList, setCameraList] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState<number>(0); // カメラのインデックスを管理

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
        setSelectedCameraIndex(0); // 最初のカメラを選択状態にする
      }
    };

    loadPosenet();
    getCameras();
  }, []);

  const switchCamera = async () => {
    const nextCameraIndex = (selectedCameraIndex + 1) % cameraList.length;
    setSelectedCameraIndex(nextCameraIndex);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: cameraList[nextCameraIndex].deviceId } },
    });
    webcamRef.current.video.srcObject = stream;
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
    <div className="p-10">
      <div className="p-5 text-center">
        <RoundedButtonOnClick
          onClick={() => { switchCamera() }}
        >
          Change Camera
        </RoundedButtonOnClick>
      </div>
      <div className="p-1 bg-white rounded-3xl border border-black">
        <div>
          {loading && <p>Loading PoseNet model...</p>}
          <Webcam
            ref={webcamRef}
            style={{
              visibility: 'hidden',
              width: 0,
              height: 0,
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              zIndex: 8,
              width: '100%',
              height: '100%',
              borderRadius: 24,
            }}
          />
        </div>
      </div>
    </div>

  );
};

export default PoseNetComponent;
