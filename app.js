var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fetch = require("node-fetch");

var index = require('./routes/index');
var about = require('./routes/about');
var pump = require('./routes/pump');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

let totalRaised = 0;

http.listen(3000, function() {
    console.log('listening on *:3000');
 });

 io.on('connection', function(socket) {
  socket.emit("setAmount", {amount: totalRaised});

  console.log('A user connected');

  socket.on("clientDonation", function(data){
      console.log("Client donated $" + data.amount);
      totalRaised += (Number.parseFloat(data.amount));
      socket.broadcast.emit("donation",data);
  })

  //Whenever someone disconnects this piece of code executed
  socket.on('disconnect', function () {
      console.log('A user disconnected');
  });
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.use('/', index);
app.use('/about', about);
app.use('/pump', pump);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
