const express=require('express')
const socket=require('socket.io')
const http=require('http')
const {Chess}=require('chess.js');
const path=require('path')


const app=express();
const server=http.createServer(app);

const io=socket(server)

const chess=new Chess();
let players={};
let currentPlayer='W';

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')))

app.get('/',(req,res)=>{
    res.render('index')
})

io.on('connection',(idsocket)=>{
    if(!players.white){
        players.white=idsocket.id
        idsocket.emit('playerRole',"w")
    }else if(!players.black){
        players.black=idsocket.id
        idsocket.emit("playerRole",'b');
    }else{
        idsocket.emit('spectatorRole')
    }

    idsocket.on('disconnect',()=>{
        if(idsocket.id==players.white){
            delete players.white
        }else if(idsocket.id==players.black){
            delete players.black;
        }
    });

    idsocket.on('move',(move)=>{
        try{
            console.log(move,idsocket.id,players.black)
            console.log(move,idsocket.id,players.white) 
            if(chess.turn()=='w' && idsocket.id !=players.white)return;
            if(chess.turn()=='b' && idsocket.id !=players.black)return;
            
          const result=  chess.move(move);
          if(result){
            currentPlayer=chess.turn();
            io.emit('move',move);
            io.emit('boardState',chess.fen());
          }else{
            console.log('Invalid move : ',move);
            idsocket.emit('invalidMove',move)
          }
        }catch(err){
            console.log(err);
            idsocket.emit('Invalid move : ',err);
        }
    })
})

server.listen(3000,()=>{
    console.log('running')
})