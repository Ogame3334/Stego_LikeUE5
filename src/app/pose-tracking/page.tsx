'use client'

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { io, Socket } from 'socket.io-client';
import CommunicationFormat from '@/interfaces/CommunicationFormat';
import PoseNetComponent from '@/components/PoseCamera';
import { Pose } from '@tensorflow-models/posenet';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import RoundedButton from '@/components/RoundedButton';
import MagicInfo from '@/interfaces/MagicInfo';
import Parts from '@/enums/Parts';
import { Keypoint } from '@tensorflow-models/posenet';
import PoseState from '@/enums/PoseState';
import PoseBodyInfo from '@/interfaces/PoseBodyInfo';



type ServerToClientEvents = {
  message: (msg: string) => void;
};

type ClientToServerEvents = {
  message: (msg: string) => void;
};

const Home = () => {
  const [disconnected, setDisconnected] = useState(false);
  const [connectionInvaild, setConnectionInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [color_v, setColor_v] = useState(0);
  const [pose, setPose] = useState<Pose>({ score: 0, keypoints: [] });
  const searchParams = useSearchParams();
  const token: string = searchParams?.get('token') || '';
  const lastSendPoseTime = useRef(0);
  const [magicInfo, setMagicInfo] = useState<MagicInfo>({element: 'none'});

  const [poseBodyInfo, setPoseBodyInfo] = useState<PoseBodyInfo>({
    bodyCenter: { x: -1, y: -1 },
    groundPosY: -1,
    kneePosY: -1,
    hipPosY: -1,
    rightShoulderPosX: -1,
    leftShoulderPosX: -1,
    rightShoulderPosXOffset: -1,
    leftShoulderPosXOffset: -1,
    shoulderPosY: -1
  });

  const [poseState, setPoseState] = useState<PoseState>(PoseState.None);

  const JudgeMagicInfo = () => {
    const CheckScore = (points: Keypoint[]): boolean => {
      let allEvaluation = true;
      points.forEach((point) => {
        if(point.score < 0.5){
          allEvaluation = false;
        }
      });
      return allEvaluation;
    }
    const CalcAverage = (points: Keypoint[]): {x: number, y: number} | null => {
      let num = 0;
      let pos = {x: 0, y: 0};
      let allEvaluation = true;
      points.forEach((point) => {
        if(point.score > 0.5){
          num++;
          pos.x += point.position.x
          pos.y += point.position.y
        }
        else{
          allEvaluation = false;
        }
      });
      if(!allEvaluation) return null;
      else return {x: pos.x / num, y: pos.y / num};
    }
    if(pose.keypoints.length != 0){
      const nose = pose.keypoints[Parts.nose];
      const leftEye = pose.keypoints[Parts.leftEye];
      const rightEye = pose.keypoints[Parts.rightEye];
      const leftEar = pose.keypoints[Parts.leftEar];
      const rightEar = pose.keypoints[Parts.rightEar];
      const leftShoulder = pose.keypoints[Parts.leftShoulder];
      const rightShoulder = pose.keypoints[Parts.rightShoulder];
      const leftElbow = pose.keypoints[Parts.leftElbow];
      const rightElbow = pose.keypoints[Parts.rightElbow];
      const leftWrist = pose.keypoints[Parts.leftWrist];
      const rightWrist = pose.keypoints[Parts.rightWrist];
      const leftHip = pose.keypoints[Parts.leftHip];
      const rightHip = pose.keypoints[Parts.rightHip];
      const leftKnee = pose.keypoints[Parts.leftKnee];
      const rightKnee = pose.keypoints[Parts.rightKnee];
      const leftAnkle = pose.keypoints[Parts.leftAnkle];
      const rightAnkle = pose.keypoints[Parts.rightAnkle];
      
      const distanceShoulder = poseBodyInfo.leftShoulderPosX - poseBodyInfo.rightShoulderPosX;
      setPoseBodyInfo({
        bodyCenter: CalcAverage([leftShoulder, rightShoulder, leftHip, rightHip]) ?? poseBodyInfo.bodyCenter,
        groundPosY: CalcAverage([leftAnkle, rightAnkle])?.y ?? poseBodyInfo.groundPosY,
        kneePosY: CalcAverage([leftKnee, rightKnee])?.y ?? poseBodyInfo.kneePosY,
        hipPosY: CalcAverage([leftHip, rightHip])?.y ?? poseBodyInfo.hipPosY,
        rightShoulderPosX: rightShoulder.score > 0.5 ? rightShoulder.position.x : poseBodyInfo.rightShoulderPosX,
        leftShoulderPosX: leftShoulder.score > 0.5 ? leftShoulder.position.x : poseBodyInfo.leftShoulderPosX,
        rightShoulderPosXOffset: poseBodyInfo.rightShoulderPosX + distanceShoulder / 6,
        leftShoulderPosXOffset: poseBodyInfo.leftShoulderPosX - distanceShoulder / 6,
        shoulderPosY: CalcAverage([leftShoulder, rightShoulder])?.y ?? poseBodyInfo.shoulderPosY
      });

      if(CheckScore([rightWrist, leftWrist])){
        if(
          rightWrist.position.x > poseBodyInfo.rightShoulderPosX &&
          rightWrist.position.x < poseBodyInfo.leftShoulderPosX && 
          rightWrist.position.y > nose.position.y &&
          rightWrist.position.y < poseBodyInfo.bodyCenter.y && 
          leftWrist.position.x > poseBodyInfo.rightShoulderPosX &&
          leftWrist.position.x < poseBodyInfo.leftShoulderPosX && 
          leftWrist.position.y > nose.position.y &&
          leftWrist.position.y < poseBodyInfo.bodyCenter.y 
        ){
          setPoseState(PoseState.PutHandsTogether);
        }
        else if(rightWrist.position.y > poseBodyInfo.kneePosY && leftWrist.position.y > poseBodyInfo.kneePosY){
          if(poseState === PoseState.PutHandsTogether){
            setPoseState(PoseState.None);
            setMagicInfo({element: 'rock'});
          }
        }
        else if(
          rightWrist.position.x < rightElbow.position.x &&
          rightWrist.position.y < poseBodyInfo.hipPosY &&
          rightWrist.position.y > poseBodyInfo.shoulderPosY &&
          leftWrist.position.x > leftElbow.position.x &&
          leftWrist.position.y < poseBodyInfo.hipPosY &&
          leftWrist.position.y > poseBodyInfo.shoulderPosY
        ){
          if(poseState === PoseState.PutHandsTogether){
            setPoseState(PoseState.None);
            setMagicInfo({element: 'fire'});
          }
        }
        else if(
          rightWrist.position.x < rightElbow.position.x &&
          rightWrist.position.y < nose.position.y &&
          leftWrist.position.x > leftElbow.position.x &&
          leftWrist.position.y < nose.position.y
        ){
          if(poseState === PoseState.PutHandsTogether){
            setPoseState(PoseState.None);
            setMagicInfo({element: 'wind'});
          }
        }
      }
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined') {
        document.body.style.setProperty('--color-v', String(color_v));
        setColor_v((prev) => prev + 1);
      }
    }, 100);

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, [color_v]);

  useEffect(() => {
    const now = Date.now();
    if (now - lastSendPoseTime.current < 500) {
      return;
    }
    JudgeMagicInfo();
    lastSendPoseTime.current = now;
  }, [pose]);

  useEffect(()=>{
    sendPose();
  }, [magicInfo])

  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('{}');

  useEffect(() => {
    if (socket) {
      console.log('token: ', token);
      socket.send(JSON.stringify({
        from: 'camera',
        method: 'camera-ready',
        content: {
          token: token
        }
      } as CommunicationFormat));
    }
  }, [isLoading, socket, token]);

  const sendPose = () => {
    if (socket) {
      socket.send(JSON.stringify({
        from: 'camera',
        method: 'pose-send',
        content: {
          token: token,
          pose: pose,
          magicInfo: magicInfo
        }
      } as CommunicationFormat));
    } else {
      console.log(`socketがないよ: ${socket}`);
    }
  };

  useEffect(() => {
    // APIルートを呼び出してSocket.IOサーバーを初期化
    fetch('/api/server').finally(() => {
      // Socket.IOクライアントを初期化
      const socketIo: Socket<ServerToClientEvents, ClientToServerEvents> = io({
        path: '/api/server'
      });

      // 接続時の処理
      socketIo.on('connect', () => {
        console.log('connected');
      });

      // メッセージを受信したときの処理
      socketIo.on('message', (msg) => {
        const data: CommunicationFormat = JSON.parse(msg);
        if (data.method === 'connection-completed') {
          setIsLoading(false);
        }
        else if (data.method === 'connection-invalid') {
          setConnectionInvalid(true);
        }
        else if (data.method === 'disconnected') {
          setDisconnected(true);
        }
        console.log(msg);
        setResponse(msg);
      });

      // 切断時の処理
      socketIo.on('disconnect', () => {
        console.log('disconnected');
      });

      // Socket.IOインスタンスをセット
      setSocket(socketIo);

      return () => {
        // コンポーネントがアンマウントされるときの処理
        socketIo.disconnect();
      };
    });
  }, []);

  return (
    <main className="w-full h-full">
      <div className="top-container w-full h-full main-container">
        {disconnected ?
          <>
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="text-5xl md:text-8xl lg:text-9xl">
                Disconnected
              </div>
              <RoundedButton
                href="/">
                <div className="text-xl md:text-3xl p-3">
                  Return Top
                </div>
              </RoundedButton>
            </div>
          </>
          :

          connectionInvaild ?
            <>
              <div className="w-full h-full flex flex-col justify-center items-center">
                <div className="text-5xl md:text-8xl lg:text-9xl">
                  Connection Invalid
                </div>
                <RoundedButton
                  href="/">
                  <div className="text-xl md:text-3xl p-3">
                    Return Top
                  </div>
                </RoundedButton>
              </div>
            </>
            :
            <>
              {isLoading ?
                <div className="w-full h-full flex flex-col justify-center items-center">
                  <Image
                    src='/loading.svg'
                    width={300}
                    height={300}
                    alt='loading...'
                  />
                </div>
                : <></>}
              <div className={`${isLoading ? 'invisible' : ''}`}>
                {/* <div className="flex"> */}
                  <PoseNetComponent
                    pose={pose}
                    setPose={setPose}
                    setNowLoding={(setIsLoading)}
                    poseBodyInfo={poseBodyInfo}
                  />
                  {/* <div>
                    <div className="h-32" />
                    <p>PoseState: {PoseState[poseState]}</p>
                    <p>magic element: {magicInfo.element}</p>
                    {pose.keypoints.map((elem, i) => (
                      (elem.score > 0.5) ?
                      <div key={i}>
                        {`${elem.part}: ${Math.round(elem.position.x * 10) / 10}, ${Math.round(elem.position.y * 10) / 10}`}
                      </div>
                      : <></>
                    ))}
                    <p>groundPosY: {Math.round(poseBodyInfo.groundPosY * 10) / 10}</p>
                    <p>kneePosY: {Math.round(poseBodyInfo.kneePosY * 10) / 10}</p>
                    <p>hipPosY: {Math.round(poseBodyInfo.hipPosY * 10) / 10}</p>
                    <p>bodyCenter: ({Math.round(poseBodyInfo.bodyCenter.x * 10) / 10}, {Math.round(poseBodyInfo.bodyCenter.y * 10) / 10})</p>
                  </div>
                </div> */}
              </div>
            </>
        }
      </div>
    </main>
  );
};

const HomePage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Home />
  </Suspense>
);

export default HomePage;
