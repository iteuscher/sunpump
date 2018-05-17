var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function (req, res) {
  res.sendFile(path.resolve('views/about.html'));
});


module.exports = router;
