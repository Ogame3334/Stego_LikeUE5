'use client'

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import CommunicationFormat from '@/interfaces/CommunicationFormat';

type ServerToClientEvents = {
  message: (msg: string) => void;
};

type ClientToServerEvents = {
  message: (msg: string) => void;
};

const Home = () => {
  const [color_v, setColor_v] = useState(0);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined') {
        document.body.style.setProperty('--color-v', String(color_v));
        setColor_v((prev) => prev + 1);
      }
    }, 100);

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, [color_v]);

  
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('{}');

  useEffect(() => {
    fetch('/api/server').finally(() => {
      const socketIo: Socket<ServerToClientEvents, ClientToServerEvents> = io({
        path: '/api/server'
      });

      socketIo.on('connect', () => {
        console.log('connected');
      });

      socketIo.on('message', (msg) => {
        const data: CommunicationFormat = JSON.parse(msg);
        if(data.method === 'connection-applied'){
          window.location.href = `/pose-tracking?token=${data.content.token}`
        }
        console.log(msg);
        setResponse(msg);
      });

      socketIo.on('disconnect', () => {
        console.log('disconnected');
      });

      setSocket(socketIo);

      return () => {
        socketIo.disconnect();
      };
    });
  }, []);

  const sendConnectRequest = () => {
    if(socket){
      console.log('sended!!')
      socket.send(JSON.stringify({
        from: 'connection-page',
        method: 'enter-pin',
        content: {
          pin: Number(message)
        }
      } as CommunicationFormat))
    }
  }

  return (
    <main className="w-full h-full">
       <div className="top-container w-full h-full main-container">
           <div className="w-full h-full flex flex-col justify-center items-center">
             <div className="text-3xl md:text-6xl lg:text-7xl">
                Enter The Access Key
             </div>
             <input
              type="text"
              className='p-3 m-20 rounded-full text-center border border-black'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e)=>{
                if(e.key === 'Enter'){
                  sendConnectRequest();
                }
              }}
            />
           </div>
         </div>
     </main>
  );
};

export default Home;
