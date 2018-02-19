var express = require('express');
var promise = require('promise');
var db = require('../con_db.js')
var router = express.Router();
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var saltRounds = 10;
var responseJSON, resetCode = "";

function checkForUser (contingentID, email) {

    return new promise(function(resolve, reject) {

        db.user.find({contingentID:contingentID, email:email}, function(err, res) {

            if(err) {
                responseJSON = {
                    'code':401,
                    'message':'failed to connect to database'
                };
                reject(responseJSON);
            }

            else {

                if(res.length == 0) {
                    responseJSON = {
                        'code':401,
                        'message':'no such user found'
                    };

                    reject(responseJSON);
                }
                else if (res.length == 1){
                    resolve();
                }
            }

        });

    });
}

function generateResetCode() {

    return new promise(function(resolve, reject) {
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (i = 0; i < 16; i++) {
            resetCode = resetCode + possible.charAt(Math.floor(Math.random() * possible.length));
        }

        resolve(resetCode);
    });

}

function sendResetPasswordMail(email, resetCode) {

    return new promise(function(resolve, reject) {


        var link = "localhost:3000/resetPassword?code=" + resetCode;

        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'asce.conference18@gmail.com',
                pass: 'ASDFGHJKL123@'
            }
        });

        // setup email 
        let mailOptions = {
            from: '"ASCE" <asce.conference18@gmail.com>',
            to: email,
            subject: 'Greetings from ASCE',
            html: '<p>You may click on the given link to reset your password<br><a href=http://'+link+'>'+link+'</a></p>'
        };

        // send mail 
        transporter.sendMail(mailOptions, function (err, info) {

            if (err) {
                responseJSON = {
                    'code':401,
                    'message':'password reset mail could not be sent'
                }
                reject(responseJSON);
            }

            else {
                responseJSON = {
                    'code':200,
                    'message':'password reset mail send'
                }
                resolve(responseJSON);
            }

        });

    });
}

function saveToDB(contingentID, email, newPassword, resetCode) {

    return new promise(function(resolve, reject) {

        var tempUser = {
            resetCode:resetCode,
            newPassword:newPassword
        };
    
        db.tempUser.update({contingentID:contingentID, email:email}, tempUser, {upsert:true}, function(err) {
            
            if (err) {
                responseJSON = {
                    'code': 401,
                    'message': 'could not connect to database'
                };

                reject(responseJSON);
            }

            else {
                resolve();
            }
        });

    
    });
}



router.post('/', function(req, res, next) {
  
    const contingentID = req.body.contingentID;
    const email = req.body.email;
    const newPassword = req.body.newPassword;
    
    checkForUser(contingentID, email).then(function() {
        return generateResetCode()
    }).then(function(code) {
        return saveToDB(contingentID, email, newPassword, code);
    }).then(function() {
        return sendResetPasswordMail(email, resetCode);
    }).then(function(responseJSON) {
        res.json(responseJSON).end();
    }).catch(function(responseJSON) {
        res.json(responseJSON).end();
    });

});


function checkForResetCode(resetCode) {
    return new promise(function(resolve, reject) {

        db.tempUser.find({resetCode:resetCode},function(err, res) {

            if(err) {
                responseJSON = {
                    'code':401,
                    'message':'error connecting to database'
                }

                reject(responseJSON);
            }

            else if(res.length == 0) {
                responseJSON = {
                    'code':401,
                    'message':'no reset password request found'
                }

                reject(responseJSON);
            }

            else if(res.length == 1) {
                resolve({
                    'continegentID':res[0].contingentID,
                    'newPassword':res[0].newPassword
                });
            }

        });
    });
}

function deleteFromTempUser(code) {
    return new promise(function(resolve, reject) {
        db.tempUser.remove({resetCode:code}, function(err) {
            
            if(err) {
                responseJSON = {
                    'code':401,
                    'message':'error deleting from temp user'
                }
                reject(responseJSON);
            }

            else {
                resolve();
            }

        });
    });
}

function updatePassword(contingentID, newPassword) {
    return new promise(function(resolve, reject) {
            
        bcrypt.genSalt(saltRounds, function(genSaltErr, salt) {
            bcrypt.hash(newPassword, salt, function(hashErr, hash) {
                db.user.findOneAndUpdate({"contingentID":contingentID},{"password":hash}, function(err) {
                    if(err) {
                        responseJSON = {
                            'code':401,
                            'message':'password could not be updated'
                        }
                        reject(responseJSON);
                    }
        
                    else {
                        resolve();
                    }
                });
        
                
            });
        });
    });
}



router.get('/', function(req, res, next) {

    const code = req.query.code;
    checkForResetCode(code).then(function(responseJSON) {
        var cID = responseJSON.continegentID;
        var pass = responseJSON.newPassword;
        return updatePassword(cID, pass);
    }).then(function() {
        return deleteFromTempUser(code);
    }).then(function() {
        responseJSON = {
            'code':200,
            'message':'action completed'
        }
        res.json(responseJSON).end();
    }).catch(function(rejectJSON) {
        res.json(rejectJSON).end();
    });


});

module.exports = router;