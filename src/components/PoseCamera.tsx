import React, { useRef, useEffect, useState } from 'react';
import * as posenet from '@tensorflow-models/posenet';
import '@tensorflow/tfjs';
import Webcam from 'react-webcam';
import RoundedButtonOnClick from './RoundedButtonOnClick';
import PoseBodyInfo from '@/interfaces/PoseBodyInfo';
import Parts from '@/enums/Parts';

interface PoseNetComponentProp {
  pose: posenet.Pose;
  setPose: Function;
  setNowLoding: Function;
  poseBodyInfo: PoseBodyInfo;
}

const PoseNetComponent: React.FC<PoseNetComponentProp> = (props: PoseNetComponentProp) => {
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [cameraList, setCameraList] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState<number>(0); // カメラのインデックスを管理

  useEffect(()=>{
    props.setNowLoding(loading);
    console.log('loading', loading);
  }, [loading])

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

  useEffect(() => {
    if (props.pose && canvasRef.current && webcamRef.current) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      drawCanvas(props.pose, video, videoWidth, videoHeight, canvasRef);
    }
  }, [props.pose, props.poseBodyInfo]);

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
    
    const noseY = props.pose.keypoints[Parts.nose]?.position.y || -1;
    ctx!.beginPath();
    ctx!.moveTo(0, noseY);
    ctx!.lineTo(canvas.current!.width, noseY);
    ctx!.strokeStyle = 'yellow';
    ctx!.lineWidth = 2;
    ctx!.stroke();

    ctx!.beginPath();
    ctx!.arc(props.poseBodyInfo.bodyCenter.x, props.poseBodyInfo.bodyCenter.y, 5, 0, 2 * Math.PI);
    ctx!.fillStyle = 'limegreen';
    ctx!.fill();

    ctx!.beginPath();
    ctx!.moveTo(0, props.poseBodyInfo.bodyCenter.y);
    ctx!.lineTo(canvas.current!.width, props.poseBodyInfo.bodyCenter.y);
    ctx!.strokeStyle = 'limegreen';
    ctx!.lineWidth = 2;
    ctx!.stroke();

    ctx!.beginPath();
    ctx!.moveTo(0, props.poseBodyInfo.shoulderPosY);
    ctx!.lineTo(canvas.current!.width, props.poseBodyInfo.shoulderPosY);
    ctx!.strokeStyle = 'yellow';
    ctx!.lineWidth = 2;
    ctx!.stroke();

    ctx!.beginPath();
    ctx!.moveTo(0, props.poseBodyInfo.groundPosY);
    ctx!.lineTo(canvas.current!.width, props.poseBodyInfo.groundPosY);
    ctx!.strokeStyle = 'yellow';
    ctx!.lineWidth = 2;
    ctx!.stroke();
    
    ctx!.beginPath();
    ctx!.moveTo(0, props.poseBodyInfo.kneePosY);
    ctx!.lineTo(canvas.current!.width, props.poseBodyInfo.kneePosY);
    ctx!.strokeStyle = 'yellow';
    ctx!.lineWidth = 2;
    ctx!.stroke();

    ctx!.beginPath();
    ctx!.moveTo(0, props.poseBodyInfo.hipPosY);
    ctx!.lineTo(canvas.current!.width, props.poseBodyInfo.hipPosY);
    ctx!.strokeStyle = 'yellow';
    ctx!.lineWidth = 2;
    ctx!.stroke();

    ctx!.beginPath();
    ctx!.moveTo(props.poseBodyInfo.rightShoulderPosX, 0);
    ctx!.lineTo(props.poseBodyInfo.rightShoulderPosX, canvas.current!.height);
    ctx!.strokeStyle = 'yellow';
    ctx!.lineWidth = 2;
    ctx!.stroke();

    ctx!.beginPath();
    ctx!.stroke();
    ctx!.moveTo(props.poseBodyInfo.rightShoulderPosXOffset, 0);
    ctx!.lineTo(props.poseBodyInfo.rightShoulderPosXOffset, canvas.current!.height);
    ctx!.strokeStyle = 'blue';
    ctx!.lineWidth = 2;
    ctx!.stroke();

    ctx!.beginPath();
    ctx!.moveTo(props.poseBodyInfo.leftShoulderPosX, 0);
    ctx!.lineTo(props.poseBodyInfo.leftShoulderPosX, canvas.current!.height);
    ctx!.strokeStyle = 'yellow';
    ctx!.lineWidth = 2;
    ctx!.stroke();

    ctx!.beginPath();
    ctx!.moveTo(props.poseBodyInfo.leftShoulderPosXOffset, 0);
    ctx!.lineTo(props.poseBodyInfo.leftShoulderPosXOffset, canvas.current!.height);
    ctx!.strokeStyle = 'blue';
    ctx!.lineWidth = 2;
    ctx!.stroke();
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
              transform: 'scaleX(-1);'
            }}
          />
        </div>
      </div>
    </div>

  );
};

export default PoseNetComponent;
