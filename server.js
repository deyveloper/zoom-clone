const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { ExpressPeerServer } = require('peer')
const MainRouter = require('./routes/main')

// Environment varaibles
const PORT = process.env.PORT || 5000

// Init app
const app = express()
app.set('view engine', 'ejs')

// Init server
const server = require('http').Server(app)
const io = require('socket.io')(server)
const peerServer = ExpressPeerServer(server, {
    debug: true
})



app.use(express.static('public'))
app.use('/peerjs', peerServer)
app.use('/', MainRouter)


io.on('connection', (socket) => {
    peerServer.on('disconnect', (data) => {
        socket.broadcast.emit('user-disconnect', data)
    })

    socket.on('join-room', ({ ROOM_ID, USER_ID }) => {
        socket.join(ROOM_ID)
        socket.to(ROOM_ID).broadcast.emit('user-connected', { ROOM_ID, USER_ID })
    })

    socket.on('message', ({ MESSAGE, ROOM_ID, USER_ID }) => {
        socket.to(ROOM_ID).broadcast.emit('createMessage', { MESSAGE, ROOM_ID, USER_ID })
    })

    socket.on('disconnect', (reason) => {
        
    })
})



// Listening
server.listen(PORT)