var express = require('express');
var promise = require('promise');
var router = express.Router();
var commoditiesData = require('../commoditiesData.json');
var db = require('../con_db.js');


function getItem(data, itemID, itemType, callback) {
    var newItem = {};
    var cartDetails = commoditiesData[itemType]
    for (var i = 0; i < cartDetails.length; i++) {
        if (cartDetails[i].productID == itemID) {
            newItem = cartDetails[i];
            return callback(newItem);
        }
    }
}

function checkForClash(newItem, cart,itemType, callback) {

    var events = cart["events"];
    var workshops = cart["workshops"];

    var i = 0,
        j = 0;

    if(itemType=="events"){
        var flag=0;
        if(newItem.productID == "asce_e13" || newItem.productID == "asce_e3" || newItem.productID == "asce_e9"){
            for (i = 0; i < events.length; i++) {
                if(events[i].productID == "asce_e13" && newItem.productID == "asce_e13"){
                    f=1;
                    return callback(false)
                }else if(events[i].productID == "asce_e3" && newItem.productID == "asce_e3"){
                    f=1;
                    return callback(false)
                }else if(events[i].productID == "asce_e9" && newItem.productID == "asce_e9"){
                    f=1;
                    return callback(false)
                }
            }
            if(flag==0){
                return callback(true)
            }
        }else{
            var flag=0;  
            for (i = 0; i < events.length; i++) {
                if(events[i].day == newItem.day && ((events[i].productID != "asce_e13")&&(events[i].productID != "asce_e3")&&(events[i].productID != "asce_e9"))){
                    startTime = events[i].timings.split("-")[0]
                    endTime = events[i].timings.split("-")[1]
                    startNewTime = newItem.timings.split("-")[0]
                    endNewTime = newItem.timings.split("-")[1]
                    if (startTime <= startNewTime || startNewTime < endTime ||
                        startTime < endNewTime || endNewTime <= endTime) {
                        flag=1;
                        return callback(false)
                    }
                }
            }
            if(flag==0){
                return callback(true)
            } 
        }
    }
        else if(itemType=="workshops"){
            var flag=0;
            for (j = 0; j < workshops.length; j++) {
                if (workshops[j].day == newItem.day) {
                    startWorkshopTime = workshops[j].timings.split("-")[0]
                    endWorkshopTime = workshops[j].timings.split("-")[1]
                    startEventTime = newItem.timings.split("-")[0]
                    endEventTime = newItem.timings.split("-")[1]
                    if (startWorkshopTime <= startEventTime || startEventTime < endWorkshopTime ||
                        startWorkshopTime < endEventTime || endEventTime <= endWorkshopTime) {
                        return callback(false)
                    }
                }
            }
            if(flag==0){
                return callback(true)
            }
        }
}


function checkForClashPurchased(newItem, purchased,itemType, callback) {

    var events = purchased["events"];
    var workshops = purchased["workshops"];

    var i = 0,
        j = 0;

   if(itemType=="events"){
        var flag=0;
        if(newItem.productID == "asce_e13" || newItem.productID == "asce_e3" || newItem.productID == "asce_e9"){
            for (i = 0; i < events.length; i++) {
                if(events[i].productID == "asce_e13" && newItem.productID == "asce_e13"){
                    f=1;
                    return callback(false)
                }else if(events[i].productID == "asce_e3" && newItem.productID == "asce_e3"){
                    f=1;
                    return callback(false)
                }else if(events[i].productID == "asce_e9" && newItem.productID == "asce_e9"){
                    f=1;
                    return callback(false)
                }
            }
            if(flag==0){
                return callback(true)
            }
        }else{
            var flag=0;  
            for (i = 0; i < events.length; i++) {
                if(events[i].day == newItem.day && ((events[i].productID != "asce_e13")&&(events[i].productID != "asce_e3")&&(events[i].productID != "asce_e9"))){
                    startTime = events[i].timings.split("-")[0]
                    endTime = events[i].timings.split("-")[1]
                    startNewTime = newItem.timings.split("-")[0]
                    endNewTime = newItem.timings.split("-")[1]
                    if (startTime <= startNewTime || startNewTime < endTime ||
                        startTime < endNewTime || endNewTime <= endTime) {
                        flag=1;
                        return callback(false)
                    }
                }
            }
            if(flag==0){
                return callback(true)
            }
        }
    }
    else if(itemType=="workshops"){
        var flag=0;
        for (j = 0; j < workshops.length; j++) {
            if (workshops[j].day == newItem.day) {
                startWorkshopTime = workshops[j].timings.split("-")[0]
                endWorkshopTime = workshops[j].timings.split("-")[1]
                startEventTime = newItem.timings.split("-")[0]
                endEventTime = newItem.timings.split("-")[1]
                if (startWorkshopTime <= startEventTime || startEventTime < endWorkshopTime ||
                    startWorkshopTime < endEventTime || endEventTime <= endWorkshopTime) {
                    return callback(false)
                }
            }
        }
        if(flag==0){
            return callback(true)
        }
    }

}

router.post('/', function (req, res, next) {

    if (!req.session.id || !req.session.contingentID || !req.session.user == "user") {
        res.json({
            'message': 'You are not authorised to access this page',
            'status': '401',
            'success':false
        });
    }

    var itemID = req.body.itemID;
    var itemType = req.body.itemType;
    var contingentID = req.session.contingentID;
    var sessionID = req.session.id;

    db.user.find({
        contingentID: contingentID,
        _id: sessionID
    }, function (err, data) {
        if (err) {
            res.json({
                'message': "Error Connecting to Database, Try again later",
                'status': '501',
                'success':false
            });
        } else {
            if (data.length > 0) {
                var cart = data[0].cart;
                var purchased = data[0].purchased;
                getItem(data, itemID, itemType, function (newItem) {
                    checkForClash(newItem, cart,itemType, function (isClash) {
                        if (!isClash) {
                            res.json({
                                'message': "Event Clashed ",
                                'status': '401',
                                'success':false
                            });
                        }
                        else {
                            checkForClashPurchased(newItem, purchased,itemType, function (isClash) {
                                if (!isClash) {
                                    res.json({
                                        'message': "Event Clashed ",
                                        'status': '401',
                                        'success':false
                                    });
                                }else{
                                    cart[itemType].push(newItem)
                                    db.user.update({ contingentID: contingentID, _id: sessionID }, { cart: cart }, function (err, response) {
                                        if (err) {
                                            res.json({
                                                'message': "Error Connecting to Database, Try again later",
                                                'status': '501',
                                                'success':false
                                            });
                                        } else {
                                            res.json({
                                                'message': "Cart Updated Successfully",
                                                'status': '200',
                                                'success':true
                                            });
                                        }
                                    })
                                }
                            });
                        }
                    })

                })
            }
        }
    })

});


module.exports = router;





/*
var express = require('express');
var promise = require('promise');
var router = express.Router();
var commoditiesData = require('../commoditiesData.json');
var db = require('../con_db.js');


function getItem(data, itemID, itemType, callback) {
    var newItem = {};
    var cartDetails = commoditiesData[itemType]
    for (var i = 0; i < cartDetails.length; i++) {
        if (cartDetails[i].productID == itemID) {
            newItem = cartDetails[i]
            return callback(newItem);
        }
    }
}

function checkForClash(newItem, cart, callback) {

    var events = cart["events"];
    var workshops = cart["workshops"];

    var i = 0,
        j = 0;

    for (i = 0; i < events.length; i++) {
        if (events[i].day == newItem.day) {
            startTime = events[i].timings.split("-")[0]
            endTime = events[i].timings.split("-")[1]
            startNewTime = newItem.timings.split("-")[0]
            endNewTime = newItem.timings.split("-")[1]
            if (startTime <= startNewTime || startNewTime <= endTime ||
                startTime <= endNewTime || endNewTime <= endTime) {
                return callback(false)
            }
        }
    }

    for (j = 0; j < workshops.length; j++) {
        if (workshops[j].day == newItem.day) {
            startWorkshopTime = workshops[j].timings.split("-")[0]
            endWorkshopTime = workshops[j].timings.split("-")[1]
            startEventTime = newItem.timings.split("-")[0]
            endEventTime = newItem.timings.split("-")[1]
            if (startWorkshopTime <= startEventTime || startEventTime <= endWorkshopTime ||
                startWorkshopTime <= endEventTime || endEventTime <= endWorkshopTime) {
                return callback(false)
            }
        }
    }

    if (i == events.length && j == workshops.length) {
        return callback(true)
    }

}


router.post('/', function (req, res, next) {

    if (!req.session.id || !req.session.contingentID || !req.session.user == "user") {
        res.json({
            'message': 'You are not authorised to access this page',
            'status': '401',
            'success':false
        });
    }

    var itemID = req.body.itemID;
    var itemType = req.body.itemType;
    var contingentID = req.session.contingentID;
    var sessionID = req.session.id;

    // var itemType = "workshops"
    // var itemID = "asce_w5"

    db.user.find({
        contingentID: contingentID,
        _id: sessionID
    }, function (err, data) {
        if (err) {
            res.json({
                'message': "Error Connecting to Database, Try again later",
                'status': '501',
                'success':false
            });
        } else {
            if (data.length > 0) {
                console.log(data)
                var cart = data[0].cart;
                getItem(data, itemID, itemType, function (newItem) {
                    checkForClash(newItem, cart, function (isClash) {
                        if (!isClash) {
                            res.json({
                                'message': "Event Clashed ",
                                'status': '401',
                                'success':false
                            });
                        }
                        else {
                            cart[itemType].push(newItem)
                            db.user.update({ contingentID: contingentID, _id: sessionID }, { cart: cart }, function (err, response) {
                                if (err) {
                                    res.json({
                                        'message': "Error Connecting to Database, Try again later",
                                        'status': '501',
                                        'success':false
                                    });
                                } else {
                                    res.json({
                                        'message': "Cart Updated Successfully",
                                        'status': '200',
                                        'success':true
                                    });
                                }
                            })
                        }
                    })

                })
            }
        }
    })

});





module.exports = router;
*/


