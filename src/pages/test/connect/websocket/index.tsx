'use client'

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type ServerToClientEvents = {
  message: (msg: string) => void;
};

type ClientToServerEvents = {
  message: (msg: string) => void;
};

const Home = () => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    // APIルートを呼び出してSocket.IOサーバーを初期化
    fetch('/api/test/sockets').finally(() => {
      // Socket.IOクライアントを初期化
      const socketIo: Socket<ServerToClientEvents, ClientToServerEvents> = io({ path: '/api/socket' });

      // 接続時の処理
      socketIo.on('connect', () => {
        console.log('connected');
      });

      // メッセージを受信したときの処理
      socketIo.on('message', (msg) => {
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

  // メッセージを送信する関数
  const sendMessage = () => {
    if (socket) {
      socket.emit('message', message);
    }
  };

  return (
    <div>
      <h1>WebSocket Test</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send Message</button>
      <p>Response: {response}</p>
    </div>
  );
};

export default Home;
