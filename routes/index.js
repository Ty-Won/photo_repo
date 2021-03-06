var express = require('express');
var router = express.Router();

// let indexController = require("../controllers/index.controller");

let indexController = require("../controllers/index.controller");
/* GET home page. */
router.get('/', indexController.renderImage);

/* GET Login prompt*/
router.get('/login', indexController.login);

/* GET pathredirect redirects after token obatined*/
router.get('/oauthredirect', indexController.oauthRedirect);

module.exports = router;
