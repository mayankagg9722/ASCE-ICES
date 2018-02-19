var express = require('express');
var promise = require('promise');
var router = express.Router();
var userDb = require('../con_db.js');
var purchaseDb = require('../userHistory.js');


router.post('/addToCart', function(req, res, next) {
    
    var itemID = req.body.itemID;
    var contingentID = req.body.contingentID;

    

});


  
module.exports = router;