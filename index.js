const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, () => console.log('Server listening on at port ' + port));

app.use(express.static(path.join(__dirname, 'public')));

let numUsers = 0;

io.on('connection', (socket) => {
    let addedUser = false;
    socket.on('add user', (username) => {
        if (addedUser) return;

        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });
});

app.get('/', function(req,res){
    res.sendFile(__dirname + '/index.html');
});



