var mongoose = require('mongoose');
require('dotenv').config();
var mongoDB = 'mongodb://'+process.env.DB_USER.toString()+':'+process.env.DB_PASS.toString()+'@ds119565.mlab.com:19565/asce';
 mongoose.connect(mongoDB,
    {useMongoClient:true
 });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongo DB connection error'));

var userSchema = new mongoose.Schema({
    "firstName":String,
    "lastName":String,
    "college":String,
    "mobileNumber":String,
    "email":{type:String, unique:true},
    "password":String,
    "contingentID":{type:String, index:true, unique:true},
    "cart":Object,
    "purchased":Object
});

var tempUserSchema = new mongoose.Schema({
    "email":String,
    "contingentID":{type:String, index:true},
    "newPassword":String,
    "resetCode":String
});

var contactUsMessages = new mongoose.Schema({
    "name":String,
    "email":{type:String, unique:true},
    "message":String
});

var user = mongoose.model('user', userSchema);
var tempUser = mongoose.model('tempuser', tempUserSchema);
var contactUsMessages = mongoose.model('contactUsMessages', contactUsMessages);

exports.contactUsMessages = contactUsMessages;
exports.user = user;
exports.tempUser = tempUser;
