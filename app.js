//Requires
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fetch = require("node-fetch");
var request = require("request");
var nodeMailer = require('nodemailer')


//Routes
var index = require('./routes/index');
var about = require('./routes/about');
var pump = require('./routes/pump');
var donate = require('./routes/donate');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Set your secret key: remember to change this to your live secret key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
var stripe = require("stripe")("sk_test_UbVI1mTyg3mEoHww5x21v1Cp");
//Port
const PORT = process.env.PORT || 3001;
http.listen(PORT, function () {
  console.log('listening on *:3001');
});


//Donor Box connection code
  let totalRaised = 0;

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

//Server rendering setup
app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'assets')))

//Paths
app.use('/', index);
app.use('/about', about);
app.use('/pump', pump);
app.use('/donate', donate);


// POST route from contact form
app.post('/contact', function (req, res) {
  
  //send success
  console.log('onto the app.js nodemailer stuff!')
  res.sendStatus(200);

  let mailOpts, smtpTrans;
  smtpTrans = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'sun.pump.email.system@gmail.com',
      pass: 'murphy123andenc@p7878'
    }
  });
  mailOpts = {
    from: req.body.name + ' &lt;' + req.body.email + '&gt;',
    to: 'sun.pump.email.system@gmail.com, contact@sunpump.org',
    subject: `New message from ${req.body.name} via the Sun Pump contact form`,
    text: `New message from the Sun Pump contact form ( www.sunpump.org/#contact ).

    Name: ${req.body.name} 
    Email: ${req.body.email} 
    Message: 
      ${req.body.message}
      

       ** This is an automated email sent by the Sun Pump Express Node.js Server with NodeMailer ** `
  };
  smtpTrans.sendMail(mailOpts, function (error, response) {
    if (error) {
      return 
      console.log('ERROR sending contact form: ', error)
    }
    else {
      //res.render('contact-success');
      console.log('Welcome email sent to: ' + req.body.email);
      res.sendFile('index.html');
      return 
      console.log('contact form message sent successfully!')
    }
  });
});

app.post ('/purchase', function(req, res) {

  res.send("success")

  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.id; // Using Express

  const charge = stripe.charges.create({
    amount: 9000,
    currency: 'usd',
    description: 'Pump Bought',
    source: token,
  })
})

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
  if(req.query.name == undefined || req.query.amount == undefined){
    res.send("Failed due to bad query format");
  }
  else{
    let tempDonation = {name: req.query.name, amount: req.query.amount};
    donations.push(tempDonation);
    io.emit("donation", tempDonation);
    res.send("Success");
  }


});

function updateDonations(){
  request(url, function (error, response, body) {
    if(error){
      console.log("ERROR: Unable to update donations")
    }
    else{
      let rawDonations = JSON.parse(body);
      let newDonationsList = [];
      for(let i = 0; i < rawDonations.length; i++){
        let tempDonation = rawDonations[i];
        newDonationsList.push({name: tempDonation.donor.name, amount: tempDonation.amount});
      }

      donations = newDonationsList;
      donationsLength = donations.length;
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
//end of Donor Box


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
