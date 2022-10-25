const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const {createServer} = require('http');
const app = express();
const server = createServer(app);
const event = require('events');

app.use(cors());
app.use(express.json());

const eventEmitter = new event();
app.set('eventEmitter',eventEmitter);

app.use('/api/user', require('./Routes/browserRoutes'));
app.use('/api/auth', require('./Routes/authRoutes'));

const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

io.on('connection', (socket) => {
    socket.on('join', ({userId,roomId}) => {
        console.log('user joined',userId);
        socket.join(roomId);
        socket.emit('connected',userId);
      });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    })

    socket.on('typing',(roomId) => {
        socket.broadcast.to(roomId).emit('isTyping');
    })
  }); 
  
  eventEmitter.on('new Message', (data) => {
      console.log(data);
      io.to(data.conversationId).emit('send-message',data);
  })

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.gz5ppoe.mongodb.net/whatsapp?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    server.listen(process.env.PORT||8080);
})
.catch(err => console.log(err));