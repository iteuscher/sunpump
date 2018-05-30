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
// app.use('/about', about);
// app.use('/pump', pump);
app.use('/donate', donate);


// POST route from contact form
  app.post('/contact', function (req, res) {

    //send success
    //console.log('onto the app.js nodemailer stuff!')

    let mailOpts, smtpTrans;

    smtpTrans = nodeMailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'sun.pump.email.system@gmail.com',
        pass: 'ewbw kuao pqjs kbtg'
      }
    });

    //compose the internal email to contact@sunpump.org
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

    //send the internal email to contact@sunpump.org
    smtpTrans.sendMail(mailOpts, function (error, response) {
      if (error) {
        return
        console.log('ERROR sending contact form: '+ error)
      }
      else {

        //if the internal email sends then prep the external confirmation email


        let mailOptions = {
          from: '"Sun Pump" <sun.pump.email.system@gmail.com>', // sender address
          to: req.body.email, // list of receivers
          subject: 'Thanks for contacting Sun Pump, ' + req.body.name + '!',
          text: "We've received your message about Sun Pump.", // plain text body
          html: '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="x-apple-disable-message-reformatting"> <title>Sun Pump message received! </title> <style>/* What it does: Remove spaces around the email design added by some email clients. */ /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */ html, body{margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important;}/* What it does: Stops email clients resizing small text. */ *{-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;}/* What it does: Centers email on Android 4.4 */ div[style*="margin: 16px 0"]{margin: 0 !important;}/* What it does: Stops Outlook from adding extra spacing to tables. */ table, td{mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;}/* What it does: Fixes webkit padding issue. Fix for Yahoo mail table alignment bug. Applies table-layout to the first 2 tables then removes for anything nested deeper. */ table{border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important;}table table table{table-layout: auto;}/* What it does: Uses a better rendering method when resizing images in IE. */ img{-ms-interpolation-mode: bicubic;}/* What it does: A work-around for email clients meddling in triggered links. */ *[x-apple-data-detectors], /* iOS */ .x-gmail-data-detectors, /* Gmail */ .x-gmail-data-detectors *, .aBn{border-bottom: 0 !important; cursor: default !important; color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important;}/* What it does: Prevents Gmail from displaying an download button on large, non-linked images. */ .a6S{display: none !important; opacity: 0.01 !important;}/* If the above doesn"t work, add a .g-img class to any image in question. */ img.g-img+div{display: none !important;}/* What it does: Prevents underlining the button text in Windows 10 */ .button-link{text-decoration: none !important;}/* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89 */ /* Create one of these media queries for each additional viewport size you"d like to fix */ /* Thanks to Eric Lepetit (@ericlepetitsf) for help troubleshooting */ @media only screen and (min-device-width: 375px) and (max-device-width: 413px){/* iPhone 6 and 6+ */ .email-container{min-width: 375px !important;}}@media screen and (max-width: 480px){/* What it does: Forces Gmail app to display email full width */ div>u~div .gmail{min-width: 100vw;}}</style> <style>/* What it does: Hover styles for buttons */ .button-td, .button-a{transition: all 100ms ease-in;}.button-td:hover, .button-a:hover{background: #555555 !important; border-color: #555555 !important;}/* Media Queries */ @media screen and (max-width: 600px){/* What it does: Adjust typography on small screens to improve readability */ .email-container p{font-size: 17px !important;}}</style> </head><body width="100%" bgcolor="#222222" style="margin: 0; mso-line-height-rule: exactly;"> <center style="width: 100%; background: rgb(36, 104, 192); text-align: left;"> <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;"> Thank you for sending a message to Sun Pump! </div><div style="max-width: 600px; margin: auto;" class="email-container"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;"> <tr> <td style="padding: 20px 0; text-align: center"> </td></tr></table> <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;"> <tr> <td bgcolor="#ffffff" align="center"> <br><br><img src="https://i.imgur.com/QGGg2B4.png" width="200" height="" alt="alt_text" border="0" align="center" style="width: 100%; max-width: 200px; height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555; margin: auto;" class="g-img"> </td></tr><tr> <td bgcolor="#ffffff"> <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"> <tr> <td style="padding: 30px; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;"> <h2 style="margin: 0 0 10px 0; text-align: center; font-family: sans-serif; font-size: 22px; line-height: 130%; color: #333333; font-weight: bold;"> Thank you for contacting Sun Pump, ' + req.body.name + '!</h2> <br><p style="margin: 0; text-align: center; "> We&apos;ve received your message and will respond to you shortly. </p><br><p style="margin: 0; text-align: center; "> For your information, your message was: <br>' + req.body.message + ' </p><br><p style="margin: 0; text-align: center; "> If you have additional questions, feel free to reach out to us by responding to this email or by sending a note to contact@sunpump.org. </p></td></tr><tr> <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;"><!-- <h2 style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 18px; line-height: 125%; color: #333333; text-align: center;">You can now sign in to your Lux account by entering ' + req.body.email + ' and your password.</h2> <br>--><!-- <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: auto;"> <tr> <td style="border-radius: 3px; background: #222222; text-align: center;" class="button-td"> <a href="localhost:3000/#signin" style="background: #222222; border: 15px solid #222222; font-family: sans-serif; font-size: 13px; line-height: 110%; text-align: center; text-decoration: none; display: block; border-radius: 3px; font-weight: bold;" class="button-a"> <span style="color:#ffffff;" class="button-link">&nbsp;&nbsp;&nbsp;&nbsp;Sign In&nbsp;&nbsp;&nbsp;&nbsp;</span> </a> </td></tr></table> --> <p style="text-align:center"> Thanks, <br>The Sun Pump Team</p></td></tr></table> </td></tr></table> <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px; font-family: sans-serif; color: #f3f3f3; font-size: 12px; line-height: 140%;"> <tr> <td style="padding: 40px 10px; width: 100%; font-family: sans-serif; font-size: 12px; line-height: 140%; text-align: center; color: #f3f3f3;" class="x-gmail-data-detectors"> <a href="http://www.sunpump.org/other/confirmation-email.html" style="color: #f3f3f3; text-decoration: underline; font-weight: bold;">View as a Web Page</a> <br><br>Alameda, CA, 94501 USA <br>contact@sunpump.org <br><br></td></tr></table> </div></center></body></html>',

        };

        //send the confirmation email
        smtpTrans.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
            console.log('contact form message sent successfully to ' + req.body.email)
            res.sendStatus(200);
            res.sendFile('index.html');
            return
        });

      }
    });

  });






app.post ('/purchase', function(req, res) {

  res.send("success")

  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.id; // Using Express
  const cost = req.body.cost;

  console.log("amount/cost server side: " + req.body.cost)

  const charge = stripe.charges.create({
    amount: cost,
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
