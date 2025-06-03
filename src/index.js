const { log } = require('console');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const connectDB = require('../config/database-config');
const Chat = require('../model/chat');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    socket.on('join_room', (data) => {
        console.log("joining a room", data.roomid)
        socket.join(data.roomid);
    });

    socket.on('msg_send', async (data) => {
        console.log(data);
        const chat = await Chat.create({
            roomId: data.roomid,
            user: data.username,
            content: data.msg
        });
        io.to(data.roomid).emit('msg_rcvd', data);
    });

});
// const path = require('path');

// Set views directory explicitly
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');


app.get('/chat/:roomid', async (req, res) => {
    const chats = await Chat.find({
        roomId: req.params.roomid
    }).select('content user');
    // console.log(chats);
    res.render('index', {
        name: 'Abhrajit',
        id: req.params.roomid,
        chats: chats
    });
});

server.listen(3000, async () => {
    console.log('Server started');
    await connectDB();
    console.log("mongo db connected")
});
