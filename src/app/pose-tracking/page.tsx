'use client'

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { io, Socket } from 'socket.io-client';
import CommunicationFormat from '@/interfaces/CommunicationFormat';
import PoseNetComponent from '@/components/PoseCamera';
import { Pose } from '@tensorflow-models/posenet';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import RoundedButton from '@/components/RoundedButton';

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
    sendPose();
    lastSendPoseTime.current = now;
  }, [pose]);

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
          pose: pose
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
                <div className="flex">
                  <PoseNetComponent
                    pose={pose}
                    setPose={setPose}
                    setNowLoding={(setIsLoading)}
                  />
                  <div>
                    <div className="h-32" />
                    {pose.keypoints.map((elem, i) => (
                      <div key={i}>
                        {`${elem.part}: ${Math.round(elem.position.x * 10) / 10}, ${Math.round(elem.position.y * 10) / 10}`}
                      </div>
                    ))}
                  </div>
                </div>
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
