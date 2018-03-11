var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');

require('dotenv').config();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.all('*', function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "POST, GET");
//   res.header("Access-Control-Max-Age", "36000");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With,auth-token");
//   next();
// });


app.use(session({
  cookieName: 'session', 
  secret: 'blargadeeblargblarg_6547836587', 
  duration: 15 * 60 * 10000, 
  resave:false,
  saveUnintialized: false,
  cookie:{
    secure: false
  }
}));

var index = require('./routes/index');
var users = require('./routes/users');
var signup = require('./routes/signup');
var login = require('./routes/login');
var logout = require('./routes/logout');
var contactUs = require('./routes/contactUs');
var fetchCartData = require('./routes/mycart');
var createExcelSheet = require('./routes/createExcelSheet');
var resetPassword = require('./routes/resetPassword');
var addToCart = require('./routes/addToCart');
var getRegisteredUserData = require('./routes/getRegisteredUserData');
var removeFromCart = require('./routes/removeFromCart');
var fetchPaidUsers = require('./routes/fetchPaidUsers');
var fetchDataFromID = require('./routes/fetchDataFromID');
var fetchRegisteredUsers = require('./routes/fetchRegisteredUsers');

app.use('/', index);
app.use('/users', users);
app.use('/signup', signup);
app.use('/login', login);
app.use('/logout', logout);
app.use('/contactUs', contactUs);
app.use('/mycart', fetchCartData);
app.use('/resetPassword', resetPassword);
app.use('/createExcelSheet', createExcelSheet);
app.use('/addToCart', addToCart);
app.use('/removeFromCart', removeFromCart);
app.use('/getRegisteredUserData', getRegisteredUserData);
app.use('/fetchPaidUsers', fetchPaidUsers);
app.use('/fetchDataFromID', fetchDataFromID);
app.use('/fetchRegisteredUsers', fetchRegisteredUsers);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
