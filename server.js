const express = require("express")
const app = express()
const server = require("http").Server(app)
const io = require("socket.io")(server)
const peer = require('peer');
const {v4: uuidV4} = require("uuid");

const PORT = process.env.PORT || 5000; 

app.use(express.static('public'));
app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render('index.ejs');
})

app.get("/room", (req, res) => {
    res.redirect(`${req.url}/${uuidV4()}`)
});

app.get("/room/:roomId", (req, res) => {
    res.render("room", { roomId: req.params.roomId });
});

const peerServer = peer.ExpressPeerServer(server, { debug: true }); 
app.get('/peerjs', peerServer);

io.on("connection", socket => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit("new-member", userId)
        socket.on('disconnect', function() {
            socket.to(roomId).broadcast.emit("disconnect-user", userId);
        });
    }); 
});

server.listen(PORT)
