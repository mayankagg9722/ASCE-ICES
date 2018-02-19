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
                    data["success"] = true;
                    res.json(data);
                }
            }
        }); 

    }
    
});


module.exports = router;