var express = require('express');
var promise = require('promise');
var nodemailer = require('nodemailer');
var router = express.Router();
var db = require('../con_db.js');
var bcrypt = require('bcrypt');
var responseJSON;


router.post('/', function(req, res, next) {
    
    let contingentID = req.body.contingentID;
    let password = req.body.password;

    if(contingentID == "admin" && password == "") {

        responseJSON = {
            'success':true,
            'code': 201,
            'message': 'Successfully Logged in With Admin'
        }

        req.session.id = "adminportal7568927547856";
        req.session.contingentID = "ASCE_admin";
        req.session.user = "admin";
        req.session.username = "admin";


        // res.render('adminportal',{});
        res.json(responseJSON);
    }

    else {

        db.user.find({ contingentID: contingentID }, function (err, data) {

            if (err) {
                responseJSON = {
                    'success':false,
                    'code': 501,
                    'message': 'Error with database connection'
                };

                res.json(responseJSON).end();
                return;
            }

            if (data.length == 1) {

                bcrypt.compare(password, data[0].password, function (err, match) {

                    if (match) {

                        responseJSON = {
                            'success':true,
                            'code': 200,
                            'message': 'success'
                        };


                        req.session.id = data[0]._id;
                        req.session.username = data[0].firstName;
                        req.session.contingentID = data[0]["contingentID"];
                        req.session.user = "user";
                        // res.render('home');
                        res.json(responseJSON).end();
                    }

                    else {
                        responseJSON = {
                            'success':false,
                            'code': 401,
                            'message': 'Incorrect password'
                        };
                        res.json(responseJSON).end();
                    }


                });

            }


            else {
                responseJSON = {
                    'success':false,
                    'code': 401,
                    'message': 'User not found'
                };
                res.json(responseJSON).end();
            }

        });

    }

});

  
module.exports = router;
