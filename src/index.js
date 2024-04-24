import express from 'express';
import { randomUUID } from 'node:crypto';
import {createServer} from 'node:http';
import {Server} from 'socket.io';

const rooms = {};

const app = express();
const server = createServer(app);
const io = new Server(server);

io.on('connection',(socket)=> {
    console.log('a user connected');
    socket.on('disconnect',()=>{
        console.log('a user disconnected');
    });

    socket.on('createGame',()=>{
        const roomId = randomUUID();
        rooms[roomId] = {};
        socket.join(roomId);
        socket.emit("newGame",{roomId:roomId});
    })
});

server.listen(5000,()=> {
    console.log('Server is fire at http://localhost:5000');
});