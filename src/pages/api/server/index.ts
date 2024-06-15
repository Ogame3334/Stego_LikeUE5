import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Socket as NetSocket } from 'net';
import { cryptoHash } from '@/utils/hash';
import CommunicationFormat from '@/interfaces/CommunicationFormat';

interface SocketServer extends HttpServer {
  io?: SocketIOServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: NetSocket & {
    server: SocketServer;
  };
}

interface ClientPair {
  pin: number;
  token: string;
  game_client: any;
  camera_client: any;
}

export default (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  let clients: ClientPair[] = [];

  setInterval(()=>{
    clients.forEach((value) => console.log(`${value.pin} ${value.token} ${value.game_client} ${value.camera_client}`))
  }, 3000);

  if (!res.socket.server.io) {
    console.log('Setting up socket.io');

    const io = new SocketIOServer(res.socket.server, {
      path: '/api/server',
    });

    io.on('connection', (socket) => {
      console.log('a user connected');
      // socket.send(JSON.stringify({ token: 'poibpzodnrw'}));
      // socket.send(JSON.stringify({
      //   token: 'token'
      // }));
      socket.on('message', (msg) => {
        // console.log(msg);
        const data: CommunicationFormat = JSON.parse(msg);
        if (data.from === 'game') {
          if (data.method === 'request-connection') {
            const pin = Math.floor(Math.random() * (999999 - 111111)) + 111111;
            const token = cryptoHash(pin.toString());
            clients.push({
              pin: pin,
              token: token,
              game_client: socket,
              camera_client: null
            })
            socket.send(JSON.stringify({
              from: 'server',
              method: 'response-token',
              content: {
                pin: pin
              }
            }));
          }
        }
        else if(data.from === 'connection-page'){
          if(data.method === 'enter-pin'){
            let clientPair: ClientPair = {
              pin: -1,
              token: '',
              game_client: '',
              camera_client: ''
            }
            clients.filter((value: ClientPair) => {
              if(value.pin === data.content.pin){
                // value.camera_client = socket;
                clientPair = value;
              }
            })
            if(clientPair.pin != -1){
              socket.send(JSON.stringify({
                from: 'server',
                method: 'connection-applied',
                content: {
                  token: clientPair.token
                }
              } as CommunicationFormat));
            }
            else{
              socket.send(JSON.stringify({
                from: 'server',
                method: 'connection-invalid',
                content: {}
              } as CommunicationFormat))
            }
          }
        }
        else if(data.from === 'camera'){
          if(data.method === 'camera-ready'){
            // console.log(`token: ${data.content.token}`)
            let clientPair: ClientPair = {
              pin: -1,
              token: '',
              game_client: '',
              camera_client: ''
            }
            clients.filter((value: ClientPair) => {
              if(value.token === data.content.token){
                value.camera_client = socket;
                clientPair = value;
              }
            });
            if(clientPair.pin != -1){
              clientPair.camera_client.send(JSON.stringify({
                from: 'server',
                method: 'connection-completed',
                content: {}
              } as CommunicationFormat));
              clientPair.game_client.send(JSON.stringify({
                from: 'server',
                method: 'connection-completed',
                content: {}
              } as CommunicationFormat));
            }
            else{
              socket.send(JSON.stringify({
                from: 'server',
                method: 'connection-invalid',
                content: {}
              } as CommunicationFormat))
            }
          }
          else if(data.method === 'pose-send'){
            let clientPair: ClientPair = {
              pin: -1,
              token: '',
              game_client: '',
              camera_client: ''
            }
            clients.filter((value: ClientPair) => {
              if(value.token === data.content.token){
                clientPair = value;
              }
            });
            if(clientPair.pin != -1){
              // console.log(data.content.pose)
              clientPair.game_client.send(JSON.stringify({
                from: 'server',
                method: 'pose-send',
                content: {
                  pose: data.content.pose,
                  magicInfo: data.content.magicInfo
                }
              } as CommunicationFormat))
            }
            else{
              console.log("こっちだよ～ん")
            }
          }
        }
        else{

        }
      });
      socket.on('disconnect', () => {
        console.log('user disconnected');
        clients = clients.filter((value: ClientPair) => {
          if(value.game_client === socket || value.camera_client === socket){
            value.game_client.send(JSON.stringify({
              from: 'server',
              method: 'disconnected',
              content: {}
            } as CommunicationFormat))
            value.camera_client?.send(JSON.stringify({
              from: 'server',
              method: 'disconnected',
              content: {}
            } as CommunicationFormat))
          }
          else{
            return value;
          }
        });
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};
