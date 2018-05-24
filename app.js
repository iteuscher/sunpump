var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fetch = require("node-fetch");
var request = require("request");

var index = require('./routes/index');
var about = require('./routes/about');
var pump = require('./routes/pump');
var donate = require('./routes/donate');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const PORT = process.env.PORT || 3001;

const nodemailer = require('nodemailer');

let totalRaised = 0;

http.listen(PORT, function() {
    console.log('listening on *:3001');
 });

 io.on('connection', function(socket) {
  //socket.emit("setAmount", {amount: totalRaised});

  console.log('A user connected');

  socket.on("clientDonation", function(data){
      console.log(data.name + " donated $" + data.amount);
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.use('/', index);
app.use('/about', about);
app.use('/pump', pump);
app.use('/donate', donate);


// POST route from contact form
app.post('/contact', function (req, res) {
  let mailOpts, smtpTrans;
  smtpTrans = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'sunpumptest1@gmail.com',
      pass: 'temp_email_pass_1'
    }
  });
  mailOpts = {
    from: req.body.name + ' &lt;' + req.body.email + '&gt;',
    to: 'sunpumptest1@gmail.com',
    subject: 'New message from Sun Pump contact form',
    text: `${req.body.name} (${req.body.email}) says: ${req.body.message}`
  };
  smtpTrans.sendMail(mailOpts, function (error, response) {
    if (error) {
      res.render('contact-failure');
    }
    else {
      res.render('contact-success');
    }
  });
});

let url = "https://cbracco%40encaptech.com:UJtzrkflnFwxKaUjvEiBP0mYc6W3mkGyjHXfi37Gp48ymnGwgMOiKw@donorbox.org/api/v1/donations";
let donations = [];
let donationsLength = 0;

updateDonations();

donationsLength = donations.length;

app.get('/api/amountRaised', function(req, res){
  updateTotalRaised();
  res.send(JSON.stringify({amount: totalRaised}));
})

app.get('/api/donations', function(req, res){
  res.send(JSON.stringify(donations));
});

app.get('/api/updateDonations', function(req, res){
  setTimeout(updateDonations(), 5000);
  res.send("Success");
});

function updateDonations(){
  request(url, function (error, response, body) {
    if(error){
      console.log("ERROR: Unable to update donations")
    }
    else{
      donations = JSON.parse(body);
      if(donations.length > donationsLength){
        let newDonation = donations[0];
        donationsLength = donations.length;
        io.emit("donation", {name: newDonation.donor.name, amount: newDonation.amount})
      }
    }
  });
  updateTotalRaised();
}

function updateTotalRaised(){
  let tempTotal = 0;
  for(let i = 0; i < donations.length; i++){
    let currDonation = donations[i];
    tempTotal += parseFloat(currDonation.amount);
  }
  totalRaised = tempTotal;
}




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('NotFound');
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
