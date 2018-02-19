var express = require('express');
var promise = require('promise');
var router = express.Router();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
var db = require('../con_db.js');
var request = require('request');

router.get('/', function(req, res, next) {
  if(req.session.id && req.session.user=="user")
  {
    res.render('index', {option:"Profile"});
  }

  else {
    res.render('index', {option:"Login"});
  }
});

router.get('/loaderio-a7e94f41e819767638c87b48d1e30ffa', function(req, res, next) {
  res.end("loaderio-a7e94f41e819767638c87b48d1e30ffa");
});

router.get('/aboutus', function(req, res, next) {
  if(req.session.id && req.session.user=="user")
  {
    res.render('aboutus', {option:"Profile"});
  }

  else {
    res.render('aboutus', {option:"Login"});
  }
});


router.get('/canoe', function(req, res, next) {
  if(req.session.id && req.session.user=="user")
  {
    res.render('canoe', {option:"Profile"});
  }

  else {
    res.render('canoe', {option:"Login"});
  }
});

router.get('/admin', function(req, res, next) {
  if(!req.session.id || !req.session.user=="admin") {
  res.json({
    "message":"Please log in to continue",
    "code":401,
    "success":false
  });}
  else{
  res.render('adminportal');}
});

router.get('/conference', function(req, res, next) {
  if(req.session.id && req.session.user=="user")
  {
    res.render('conference', {option:"Profile"});
  }

  else {
    res.render('conference', {option:"Login"});
  }
});

router.get('/events', function(req, res, next) {
  if(req.session.id && req.session.user=="user")
  {
    res.render('events', {option:"Profile"});
  }

  else {
    res.render('events', {option:"Login"});
  }
});


router.get('/profile',function(req,res,next){
  if(req.session.id && req.session.user=="user") {
  res.render('profile-new',{name:req.session.username});
  }
  else {
    res.render('index', {option:"Login"});
  //   res.json({
  //   "message":"Please log in to continue",
  //   "code":401,
  //   "success":false
  // }); 
}
});
// router.get('/mycart',function(req,res,next){
//   if(req.session.id && req.session.user=="user") {
//   res.render('myCart');
//   }
//   else {
//     res.json({
//     "message":"Please log in to continue",
//     "code":401,
//     "success":false
//   });
//   }
// });
router.get('/login', function(req, res, next) {
  if(req.session.id && req.session.user == "admin") {
    res.render('adminportal');
  }

  if(req.session.id && req.session.user == "user") {
    res.redirect('/profile');
  }
  
  else {
    res.render('login');
  }
});

router.get('/model', function(req, res, next) {
  if(req.session.id && req.session.user=="user")
  {
    res.render('model', {option:"Profile"});
  }

  else {
    res.render('model', {option:"Login"});
  }
});

router.get('/register', function(req, res, next) {
  res.render('register', {'message':undefined});
});

router.get('/workshop', function(req, res, next) {
  if(req.session.id && req.session.user=="user")
  {
    res.render('workshop', {option:"Profile"});
  }

  else {
    res.render('workshop', {option:"Login"});
  }
});

function calculateTotal(data, cart, callback) {
  var total = 0;
  cart["workshops"].forEach(element => {
    total += element["price"];
  });

  cart["events"].forEach(element => {
    total += element["price"];
  });

  callback(data, total);
}


function getTotal(contingentID, sessionID, callback) {


  db.user.find({ contingentID: contingentID, _id: sessionID }, { cart: 1 }, function (err, data) {
    if (err) {
      res.json({
        'success': false,
        'message': 'Error Connecting to Database, Try again Later',
        'status': '501'
      });
    }
    else {
      calculateTotal(data, data[0].cart, function (data, total) {
        callback(total);
      });
    }
  });
}

// router.get('/test', function (req, res, next) {
//   console.log("working test");
// });

router.get('/payment', function (req, res, next) {
  if(!req.session.id || !req.session.contingentID) {
    // res.json({
    //   'message':'You are not authorized to access this page',
    //   'status':'401',
    //   'success':false
    // });
    res.redirect('/login');
  }

  else {

    var contingentID = req.session.contingentID;
    var sessionID = req.session.id;
    var name = req.session.firstName;


    getTotal(contingentID, sessionID, function(total) {
      request.post({
        url: 'https://academics.vit.ac.in/online_application2/onlinepayment/Online_pay_request1.asp',
        followAllRedirects: true,
        form: {
          "id_trans": contingentID,
          "id_event": "188",
          "amt_event": String(total),
          "id_merchant": "1187",
          "id_password": "VvIDWJruzAXRJzR",
          "rturl": "http://asceis-ices.com/cart/getDetails",
          "id_name": String(name)
        }
      }, function (error, response, body) {
        if(error){
          res.json({
            'message':'Gateway not reachable',
            'status':'304',
            'success':false
          });
        }else{
          res.set('Content-Type', 'text/html');
          res.send(new Buffer(body));  
        }
      });

    });  

  }
});


function getCart(contingentID, callback) {

  db.user.find({contingentID: contingentID}, { cart: 1, purchased: 1 }, function (err, data) {
    if (err) {
      res.json({
        'success': false,
        'message': 'Error Connecting to Database, Try again Later',
        'status': '501'
      });
    }
    else {
      calculateTotal(data, data[0].cart, function (data, total) {
        callback(total,data);
      });
    }
  });
}

function updateCartAndPurchasedDetails(contingentID, callback) {
  db.user.find({ contingentID: contingentID}, { cart: 1, purchased: 1 }, function (err, data) {
     
    var workshops=data[0].cart.workshops;
    var events=data[0].cart.events;

    workshops.forEach(function(element, index) {
          data[0].purchased.workshops.push(element);
    });

    events.forEach(function(element, index) {
      data[0].purchased.events.push(element);
    });

    data[0].cart.workshops=[];
    data[0].cart.events=[];

    callback(data);
  
  });
}
/*
router.get('/test', function (req, res, next) {
  var contingentID="ASCE_38962";
  getCart(contingentID, function(total,data) {
    var cart = data[0].cart;
    updateCartAndPurchasedDetails(contingentID, function(data) {
        db.user.update({contingentID: contingentID},{$set:{cart:data[0].cart,purchased:data[0].purchased}},function(err,data){
          if(err){
            res.json({
              'message':'database payment update failure',
              'status':'401',
              'success':false
            });
          }
          else{
            res.json({
              'message':'cart successfully updated',
              'status':'200',
              'success':false
            });
          }
        });
    })
  });
});

*/
router.post('/cart/getDetails', function (req, res, next) {
  finalJson=req.body;
  console.log("################# PAYMENT #################")
  console.log(finalJson)
  console.log("################# PAYMENT #################")
  var contingentID=finalJson.Refno;
  if(finalJson.status=='0399'){
    res.json({
      'message':'Your payment failed',
      'status':'401',
      'success':false
    });
  }
  else if(finalJson.status=='0300'){
    getCart(contingentID, function(total,data) {
      var cart = data[0].cart;
      updateCartAndPurchasedDetails(contingentID, function(data) {
          db.user.update({contingentID: contingentID},{$set:{cart:data[0].cart,purchased:data[0].purchased}},function(err,data){
            if(err){
              res.json({
                'message':'database payment update failure',
                'status':'401',
                'success':false
              });
            }
            else{
              res.json({
                'message':'cart successfully updated',
                'status':'200',
                'success':false
              });
            }
          });
      })
    });
  }
});


module.exports = router;
