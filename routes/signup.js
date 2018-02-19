var express = require('express');
var promise = require('promise');
var nodemailer = require('nodemailer');
var router = express.Router();
var bcrypt = require('bcrypt');
var saltRounds = 10;
var db = require('../con_db.js');
var responseJSON;
require('dotenv').config();

function generateNewContingentID(){

    var contingentID = "ASCE_";
    let possible = "0123456789";

    for (i = 0; i < 5; i++) {
        contingentID = contingentID + possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return contingentID;
}


function generateContingentID() {


    return new Promise(function (resolve, reject) {
        var contingentID = "ASCE_";
        let possible = "0123456789";

        for (i = 0; i < 5; i++) {
            contingentID = contingentID + possible.charAt(Math.floor(Math.random() * possible.length));
        }
        resolve(contingentID);
    });
}


function validateFields(email, password1, password2, mobileNumber) {
    return new Promise(function (resolve, reject) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var mobileNumberRegex = /^[1-9]{1}[0-9]{9}/;
        if(re.test(email) && mobileNumberRegex.test(mobileNumber) && (password1 == password2)) {
            resolve(true);
        }

        else {
            if(!re.test(email)) {
                reject({
                    'success':false,
                    'message':'Please Enter a Valid Email ID',
                    'status':'401',
                    'code':401,
                });
            }

            if(!mobileNumberRegex.test(mobileNumber)) {
                reject({
                    'message':'Please enter a valid mobile number',
                    'status':'401',
                    'code':401,
                    'succuess':false
                });
            }

            if(password1 != password2){
                reject({
                    'message':'Passwords do not match, please try again',
                    'status':'401',
                    'code':401,
                    'success':false
                });
            }
        }
    });

}

function checkForContingentID(contingentID) {
   
    return new Promise(function(resolve, reject) {

        db.user.find({contingentID:contingentID}, function(err, data) {
            
            if(!err && data.length == 1) {

                var newContingentID = generateNewContingentID();

                if(newContingentID == contingentID) {
                    checkForContingentID(contingentID);
                }
                else {
                    
                    resolve(newContingentID);
                }
            }

            else {
                
                resolve(contingentID);
            }
            
        });

    });
}

function sendMail(email, contingentID) {
    return new Promise(function (resolve, reject) {
        
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'asce.conference18@gmail.com',
                pass: 'gunhouse1969'
            }
        });

        // setup email 
        let mailOptions = {
            from: '"ASCE" <asce.conference18@gmail.com>',
            to: email,
            subject: 'Greetings from ASCE',
            html: '<p>Greetings from ASCE. Your contingent ID is ' + contingentID + '. You may log into your account using this ID and the entered password.<br>Regards</p>'
        };

        // send mail 
        transporter.sendMail(mailOptions, function (err, info) {

            if (err) {
                reject(err);
            }

            else {
                resolve(info.messageId);
            }

        });
    });

}


function checkForEmailID(email) {

    return new promise(function(resolve, reject) {

        db.user.find({email:email}, function(err, data) {
            
            if(!err && data.length == 1) {

                reject({
                    'message':'Your Email ID is already taken',
                    'status':'401',
                    'code':401,
                    'success':false
                });
            }

            resolve(true);
        });
    });
}

function addUser(email, firstName, lastName, college, mobileNumber ,contingentID, password) {

    return new Promise(function(resolve, reject){

        var newUser = new db.user();
        newUser.email = email;
        newUser.password = password;
        newUser.contingentID = contingentID;
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        newUser.college = college;
        newUser.mobileNumber = mobileNumber;
        newUser.cart = {"workshops":[], "events":[]};
        newUser.purchased = {"workshops":[], "events":[]};
        
        newUser.save(function(err) {
            if(err) {
                var responseJSON = {'message':'Error connecting to database, try again later',
                                    'status':'501' ,
                                    'code':501,
                                    'success':false                   
                };

                reject(responseJSON);
            }
            else
            {
                resolve({
                    'message':'A message with contingent ID has been sent to your Email ID. Please log in to continue.',
                    'status': '200',
                    'code':200,
                    'success':true
                });
            }
        });
    });
}

function encryptPassword(password) {
    return new promise(function(resolve, reject) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                if(err) {
                    reject({
                        'message':'',
                        'status':'501',
                        'code':501,
                        'success':false
                    })
                    return;
                }

                resolve(hash);
            });
        });
    });
}


router.post('/', function(req, res, next) {
    
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const college = req.body.college;
    const mobileNumber = req.body.mobileNumber;
    var ctID = "";

    validateFields(email, password, confirmPassword, mobileNumber).then(function(validated) {
        if(validated) {
            return checkForEmailID(email);
        }
    }).then(function(validated) {
        if(validated) {
            return generateContingentID();
        }
    }).then(function(contingentID) {
        return checkForContingentID(contingentID);

    }).then(function(contingentID) {
        ctID = contingentID;
        return sendMail(email, contingentID);

    }).then(function(resolveMessage) {
        return encryptPassword(password);
        
    }).then(function(hashedPassword) {
        return addUser(email, firstName, lastName, college, mobileNumber, ctID, hashedPassword);
    
    }).then(function(resolveMessage) {
        responseJSON = resolveMessage;
        res.json(responseJSON);

    }).catch(function(rejectMessage) {
        responseJSON = rejectMessage;
        res.json(responseJSON);
    });

});


module.exports = router;
