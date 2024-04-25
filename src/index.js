import express from 'express';
import { randomUUID } from 'node:crypto';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import cors from 'cors';

const rooms = {};

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server,{
    cors:{
        origin:"http://localhost:5173"
    }
});

io.on('connection',(socket)=> {
    console.log('a user connected');
    socket.on('disconnect',()=>{
        console.log('a user disconnected');
    });

    socket.on('createGame',()=>{
        const roomId = randomUUID();
        console.log(`Room created with ID: ${roomId}`);
        rooms[roomId] = {};
        socket.join(roomId);
        socket.emit("newGame",{roomId:roomId});
    })
});

app.get("/rooms",(req,res)=>{
    res.send(rooms);    
})

server.listen(5000,()=> {
    console.log('Server is fire at http://localhost:5000');
});