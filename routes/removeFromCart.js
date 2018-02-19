var express = require('express');
var promise = require('promise');
var router = express.Router();
var db = require('../con_db.js');

router.post('/', function (req, res, next) {

        if (!req.session.id || !req.session.contingentID || !req.session.user == "user") {
                res.json({
                        'success': false,
                        'message': 'You are not authorised to access this page',
                        'status': '401'
                });
        }
        else {

                var itemID = req.body.itemID;
                var itemType = req.body.itemType;
                var contingentID = req.session.contingentID;
                var sessionID = req.session.id;

        if (itemType == "workshops") {

                    db.user.update({ contingentID: contingentID, _id: sessionID }, {
                $pull: { "cart.workshops": { "productID": itemID } }
            }, function () {
                res.json({
                    'success': true,
                    'message': 'Item successfully removed',
                    'status': '200'
                });
		
	 });

        }

        if (itemType == "events") {


                    db.user.update({ contingentID: contingentID, _id: sessionID }, {
                $pull: { "cart.events": { "productID": itemID } }
            }, function () {
		res.json({
                    'success': true,
                    'message': 'Item successfully removed',
                    'status': '200'
                });
                //res.redirect('/myCart');
            });


        }

        }
});

module.exports = router;
