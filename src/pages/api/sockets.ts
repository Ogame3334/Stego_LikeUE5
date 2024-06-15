import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Socket as NetSocket } from 'net';

interface SocketServer extends HttpServer {
  io?: SocketIOServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: NetSocket & {
    server: SocketServer;
  };
}

export default (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('Setting up socket.io');

    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
    });

    io.on('connection', (socket) => {
      console.log('a user connected');
      socket.on('message', (msg) => {
        console.log('message: ' + msg);
        socket.emit('message', 'Message received: ' + msg);
      });
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};
