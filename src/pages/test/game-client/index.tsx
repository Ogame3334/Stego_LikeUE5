'use client'

import CommunicationFormat from '@/interfaces/CommunicationFormat';
import { Pose } from '@tensorflow-models/posenet';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type ServerToClientEvents = {
  message: (msg: string) => void;
};

type ClientToServerEvents = {
  message: (msg: string) => void;
};

const Home = () => {
  const [disconnected, setDisconnected] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [pose, setPose] = useState<Pose>({ score: 0, keypoints: [] });
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('{}');

  useEffect(() => {
    // APIルートを呼び出してSocket.IOサーバーを初期化
    fetch('/api/server').finally(() => {
      // Socket.IOクライアントを初期化
      const socketIo: Socket<ServerToClientEvents, ClientToServerEvents> = io({
        path: '/api/server'
      });

      socketIo.send(JSON.stringify({
        from: 'game',
        method: 'request-connection',
        content: '{}'
      }))

      // 接続時の処理
      socketIo.on('connect', () => {
        console.log('connected');
      });

      // メッセージを受信したときの処理
      socketIo.on('message', (msg) => {
        console.log(msg);
        setResponse(msg);
        const data: CommunicationFormat = JSON.parse(msg);
        if (data.method === 'connection-completed') {
          setIsConnected(true);
        }
        else if (data.method === 'pose-send') {
          setPose(data.content.pose as Pose);
        }
        else if (data.method === 'disconnected') {
          setDisconnected(true);
        }
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

  // メッセージを送信する関数
  const sendMessage = () => {
    if (socket) {
      socket.emit('message', message);
    }
  };

  const sendConnectRequest = () => {
    if (socket) {
      socket.send(JSON.stringify({
        pin: message
      }))
    }
  }

  return (
    <div>
      {disconnected ?
        <>
          <p>disconnected</p>
        </>
        :
        isConnected ?
          <>
            <div>
              <div className="h-32" />
              {pose.keypoints.map((elem, i) => {
                return (
                  <div key={i}>
                    {`${elem.part}: ${Math.round(elem.position.x * 10) / 10}, ${Math.round(elem.position.y * 10) / 10}`}
                  </div>
                )
              })}
            </div>
          </>
          :
          <>
            <p>pin: {JSON.parse(response).content?.pin}</p>
          </>
      }
    </div>
  );
};

export default Home;
