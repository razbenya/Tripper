require('rootpath')();
var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use JWT auth to secure the api, the token can be passed in the authorization header or querystring
app.use(expressJwt({
    secret: config.secret,
    getToken: function (req) {
         
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        console.log(req);
        return null;
    }
}).unless({ path: ['/users/authenticate', '/users/register', "/socket.io/"] }));


io.sockets.on('connection', (socket) => {

    //console.log('user connected');

    socket.on('disconnect', function () {
        //console.log('user disconnected');
    });

    socket.on('follow', (user) => {
        io.emit(user, {type: user, text: user });
    });


    

});

    // routes
    app.use('/users', require('./controllers/users.controller'));


    // start server
    var port = process.env.NODE_ENV === 'production' ? 80 : 4000;
    var server = http.listen(port, function () {
        console.log('Server listening on port ' + port);
    });