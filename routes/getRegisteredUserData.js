var express = require('express');
var router = express.Router();
var db = require('../con_db.js');



router.get('/', function(req, res, next) {
    
    if(req.session.user != "admin") {
        res.json({
            'message':'You are not authorised to view these details',
            'status':'401'
        }).end();
    }

    else {
        db.user.find({}, {email:1, contingentID:1, _id:0, lastName:1, firstName:1, mobileNumber:1, college:1}, function(err, data) {
            if(err) {
                res.json({
                    'message':'error connecting to database',
                    'status': '501'
                });
            }
            else {
                res.json(data).end();
            }
        });
    }
    
});

module.exports = router;