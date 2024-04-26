import express from 'express';
import { randomUUID } from 'node:crypto';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import cors from 'cors';

const rooms = [];

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
    const playerId = randomUUID();
    socket.emit("playerId",playerId);
    socket.on('disconnect',()=>{
        console.log('a user disconnected');
    });

    socket.on('createGame',()=>{
        const roomId = randomUUID();
        console.log(`Room created with ID: ${roomId}`);
        const room = {roomId:roomId,player1:{id:playerId,choice:null},player2:{id:null,choice:null}};
        rooms.push(room);
        socket.join(roomId);
        io.emit("createGame",room);
    });

    socket.on("joinGame",(roomId,playerId)=>{
        console.log(`player joined roomId: ${roomId}`);
        socket.join(roomId);
        const roomIndex = rooms.findIndex((room)=>room.roomId===roomId);
        const room = rooms[roomIndex];
        room.player2.id = playerId;
        io.to(roomId).emit("playerJoined",room);
    });

    socket.on("choiceMade",(roomId,playerId,text) =>{
        console.log(roomId);
        const roomIndex = rooms.findIndex((room)=>room.roomId===roomId);
        const room = rooms[roomIndex];
        if(room.player1.id===playerId){
            room.player1.choice = text;
        }else{
            room.player2.choice = text;
        }

        if(room.player1.choice!=null && room.player2.choice!=null){
            const winner = decideWinner(room.player1.choice,room.player2.choice);
            console.log(`winner is ${winner}`);
            if(winner===1){
                io.to(room.roomId).emit("result","player1 wins",room);
            }else if(winner===0){
                io.to(room.roomId).emit("result","Its a tie",room);
            }else{
                io.to(room.roomId).emit("result","Player2 wins",room);
            }

            room.player1.choice = null;
            room.player2.choice = null;
        }
        console.log(room);
    });

});

const decideWinner = (player1Choice,player2Choice) => {
    if((player1Choice.toLowerCase()==="rock" && player2Choice.toLowerCase() === "scissors") || (player1Choice.toLowerCase()==="paper" && player2Choice.toLowerCase() === "rock") || (player1Choice.toLowerCase()==="scissors" && player2Choice.toLowerCase() === "paper")){
        return 1;
    }else if(player1Choice.toLowerCase()===player2Choice.toLowerCase()){
        return 0;
    }else{
        return 2;
    }
}

app.get("/rooms",(req,res)=>{
    res.send(rooms);    
})

server.listen(5000,()=> {
    console.log('Server is fire at http://localhost:5000');
});