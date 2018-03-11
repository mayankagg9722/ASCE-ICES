var express = require('express');
var promise = require('promise');
var db = require('../con_db.js');
var router = express.Router();

router.post('/', function (req, res, next) {

    if (req.session.user != "admin") {
        res.json({
            'success': false,
            'message': 'You are not authorised to view these details',
            'status': '401'
        });
    }

    else {

        var contingentID = req.body.contingentID;
        db.user.find({ contingentID: contingentID },{_id:0, password:0, __v:0}, function (err, data) {

            if (err) {
                res.json({
                    "message": "Error connecting to database",
                    "success": false,
                });
            } 
            else {
                if(data.length == 0) {
                    res.json({
                        "message":"User Not found",
                        "success":false
                    });
                }

                else {

                    var events = data[0].purchased.events;
                    var workshops = data[0].purchased.workshops;
                    var eventsString = "";
                    var workshopsString = "";
                    var eventsArray = [];
                    var workshopsArray = [];

                    events.forEach(element => {
                        var tempString = "";
                        var element = JSON.stringify(element);
                        var trimmed = element.substring(1, element.length-1);
                        eventsArray.push(trimmed);
                    });



                    workshops.forEach(element => {
                        var tempString = "";
                        var element = JSON.stringify(element);
                        var trimmed = element.substring(1, element.length-1);
                        workshopsArray.push(trimmed);
                    });

                    
            
                    res.render('userDetails', {
                        "firstName":data[0].firstName,
                        "lastName":data[0].lastName,
                        "contingentID":data[0].contingentID,
                        "email":data[0].email,
                        "events":eventsArray,
                        "workshops":workshopsArray,
                    });
                }
            }
        }); 

    }
    
});


module.exports = router;