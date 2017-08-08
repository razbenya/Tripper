require('rootpath')();
var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fileUpload = require('express-fileupload');
var path = require('path');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use JWT auth to secure the api, the token can be passed in the authorization header or querystring
app.use(expressJwt({
    secret: config.secret,
    getToken: function (req) {
        console.log(req.url);
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }

        return null;
    }
}).unless({ path: ['/users/authenticate', '/users/register', "/socket.io/", "/favicon.ico"] }));

var filter = (ele) => { return ele.startsWith('/uploads/'); ;}

io.sockets.on('connection', (socket) => {
    
    socket.on('disconnect', function () {});

    socket.on('follow', (user) => {
        io.emit(user, { type: user, text: user });
    });
    /*
    socket.on('userState', (userState) => {
        io.emit('userState', {});
    });
*/
    socket.on('post', (postId) => {
        io.emit(postId, {type: 'post',text: 'post' });
    })
});

//allow upload and images fetch
app.use(fileUpload());
app.use("/uploads", express.static(__dirname + "/uploads"));

// routes
app.use('/users', require('./controllers/users.controller'));
app.use('/images', require('./controllers/images.controller'));
app.use('/posts', require('./controllers/posts.controller'));

// start server
var port = process.env.NODE_ENV === 'production' ? 80 : 4000;
var server = http.listen(port, function () {
    console.log('Server listening on port ' + port);
});