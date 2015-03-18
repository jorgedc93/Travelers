var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
// Database
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/travelers", {native_parser:true});



//Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port    = process.env.OPENSHIFT_NODEJS_PORT || 8000;

var routes = require('./server/routes');

var app = express();
var server = require('http').createServer(app);

//Sockets
var io = require('socket.io').listen(server, { log: false });

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(favicon(__dirname + '/app/img/favicon.ico'));


app.use(express.static(__dirname + '/app'));     //try to serve static files (AngularJS Frontend)



// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/data', routes);                    //try to match req with a data management route

app.use(redirectUnmatched);                  // redirect if nothing else sent a response

// Socket.io Communication
io.sockets.on('connection', require('./server/socket'));

function redirectUnmatched(req, res) {
    res.redirect("/");
}

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.listen(port, ipaddr);
console.log("server running at http://" + ipaddr + ":" + port + "/");




module.exports = app;