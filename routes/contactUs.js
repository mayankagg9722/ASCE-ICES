var express = require('express');
var router = express.Router();
var db = require('../con_db.js');
var promise = require('promise');

router.post('/', function(req, res, next) {

    var name=req.body.name;
    var email=req.body.email;
    var message=req.body.message;

    validate(name, email, message).then(function(validated) {
        if(validated) {
            return addMessage(name, email, message);
        }
    }).then(function(acceptMessage) {
        res.json(acceptMessage);
    }).catch(function(rejectMessage) {
        res.json(rejectMessage);
    });
    
});

function validate(name, email, message) {

    return new Promise(function (resolve, reject) {

        var emailRe = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var nameRe = /[A-Z][a-z]/

        if (name != "" && email != "" && message != "") {

            if(emailRe.test(email) && nameRe.test(name)) {
                resolve(true);
            }

            else if (!emailRe.test(email)) {
                var responseJSON = {
                    'message': 'Please Enter a valid email ID',
                    'status': '401',
                    'success': false
                };
                reject(responseJSON);
            }

            else if (!nameRe.test(name)) {
                var responseJSON = {
                    'message': 'Name can only be alphabets',
                    'status': '401',
                    'success': false
                };
            }
            reject(responseJSON);
        }

        else {
            var responseJSON = {
                'message': 'All Fields are compulsory',
                'status': '401',
                'success': false
            };
            reject(responseJSON);
        }

    });
}

function addMessage(name,email,message) {

    return new Promise(function (resolve, reject) {
        
        var newMessage = new db.contactUsMessages();
        newMessage.email = email;
        newMessage.name = name;
        newMessage.message = message;

        newMessage.save(function (err) {

            if (err) {

                var responseJSON = {
                    'message': 'Error connecting to database, try again later',
                    'status': '501',
                    'success': false
                };

                reject(responseJSON);
            }

            else {
                var responseJSON = {
                    'message': 'Your Message has been saved',
                    'status': '200',
                    'success': true
                }
                resolve(responseJSON);
            }

        });
    });

}

module.exports = router;