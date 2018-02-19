/*
var express = require('express');
var promise = require('promise');
var router = express.Router();
var db = require('../con_db.js');

router.get('/', function(req, res, next) {


    if(!req.session.id || !req.session.contingentID || !req.session.user == "user") {
        res.json({
            'message':'You are not authorised to access this page',
            'status':'401'
        });
    }
    
    var itemID = req.body.itemID;
    var contingentID = req.session.contingentID;
    var sessionID = req.session.id;

    db.user.find({contingentID:contingentID, _id:sessionID}, {cart:1}, function(err, data) {
        if(err) {
            res.json({
                'message':'Error Connecting to Database, Try again Later',
                'status':'501'
            });
        }
        else {
            // console.log(data);
            // console.log(data.cart.workshops);
            res.render("myCart",{"cart":data});
            // res.json(data);
        }
    });


});


  
module.exports = router;*/


var express = require('express');
var promise = require('promise');
var router = express.Router();
var db = require('../con_db.js');

function calculateTotal(data, cart, callback) {
    var total = 0;
    cart["workshops"].forEach(element => {
        total += element["price"];
    });

    cart["events"].forEach(element => {
        total += element["price"];
    });
    
    callback(data,total);
}

router.get('/', function(req, res, next) {


    if(!req.session.id || !req.session.contingentID || !req.session.user == "user") {
        res.json({
            'success':false,
            'message':'You are not authorised to access this page',
            'status':'401'
        });
    }
    else {

        var itemID = req.body.itemID;
        var contingentID = req.session.contingentID;
        var sessionID = req.session.id;

        db.user.find({ contingentID: contingentID, _id: sessionID },{ cart: 1, purchased:1 }, function (err, data) {
            if (err) {
                res.json({
                    'success': false,
                    'message': 'Error Connecting to Database, Try again Later',
                    'status': '501'
                });
            }
            else {
                calculateTotal(data, data[0].cart, function (data,total) {
                    res.render("myCart",{"cart":data,"total":total});
                });
            }
        });

    }

});


  
module.exports = router;
