var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function (req, res) {
  res.sendFile(path.resolve('views/index.html'));
});

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });


module.exports = router;
