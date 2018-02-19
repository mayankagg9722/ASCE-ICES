var express = require('express');
var promise = require('promise');
var db = require('../con_db.js');


var router = express.Router();

router.post('/', function(req, res, next) {
    
    if(req.session.user != "admin") {
        res.json({
            'success':false,
            'message':'You are not authorised to view these details',
            'status':'401'
        });
    }

    else {
        var response = [];
        var responseJSON = {};
        var itemType = req.body.itemType;
        var itemID = req.body.itemID;

        db.user.find({}, {purchased:1, contingentID:1, mobileNumber:1, firstName:1, lastName:1, college:1, email:1}, function(err,data) {
            
            data.forEach(function(element) {

                if(element.purchased.workshops.length != 0 && itemType == "workshops") {
                    element.purchased.workshops.forEach(function(workshop) {
                        if(workshop.productID == itemID) {
                            response.push(element);
                        }
                    });
                }

                if(element.purchased.events.length != 0 && itemType == "events") {
                    element.purchased.events.forEach(function(event) {
                        if(event.productID == itemID) {
                            response.push(element);
                        }
                    });
                }
            });
            var counter = 0;
            if(response.length != 0) {
                response.forEach(function(element) {
                    responseJSON[counter] = element;
                    counter += 1;
                });
            
                res.json(responseJSON);
            }

            });


            
        }
    });


  
module.exports = router;