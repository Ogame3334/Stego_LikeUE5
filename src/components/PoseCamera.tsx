'use client'

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as posenet from '@tensorflow-models/posenet';
import '@tensorflow/tfjs';
import Webcam from 'react-webcam';

const PoseNetComponent: React.FC = () => {
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

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

          drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
        }
      };
      setInterval(detect, 100);
    };

    loadPosenet();
  }, []);

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
      <Webcam
        ref={webcamRef}
        style={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 7,
          width: 640,
          height: 480,
        //   display: 'none'
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 8,
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
};

export default PoseNetComponent;
