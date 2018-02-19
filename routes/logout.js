var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

    if(!req.session.id) {
        res.json({
            'success':false,
            'message':'No session to destroy'
        }).end();

    }
    else {

        req.session.destroy();
        res.redirect('/login');
        // res.json({
        //     'success':true,
        //     'message': 'session destroyed'
        // }).end();

    }
});

module.exports = router;
