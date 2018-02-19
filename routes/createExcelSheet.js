var express = require('express');
var router = express.Router();
var db = require('../con_db.js');
var mongoXlsx = require('mongo-xlsx');
var fs = require('fs');
var path = require('path');

router.get('/', function(req, res, next) {
    
    if(!req.session.id || !req.session.user == "admin") {
        res.json({
            'message':'You are not authorised to view these details',
            'status':'401'
        }).end();
    }

    else {
        db.user.find({},{email:1, contingentID:1, _id:0, lastName:1, firstName:1, mobileNumber:1, college:1},function(err, data) {

            var model = mongoXlsx.buildDynamicModel(data);

            mongoXlsx.mongoData2Xlsx(data, model, function(err, response) {
                
                fromDir('../',/\.xlsx$/,function(filename){

                    fs.rename(filename,'../asceBackend/users.xlsx', function(err) {
                        if ( err ){
                            console.log('ERROR: ' + err);
                        } else{
                            res.setHeader('Content-disposition', 'attachment; filename=users.xlsx');
                            res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                            res.download('../asceBackend/users.xlsx', function(err) {
                                res.end();
                            });
                        }
                    });

                });

            });
        });
    }
});

function fromDir(startPath,filter,callback){
        if (!fs.existsSync(startPath)){
            return;
        }
    
        var files=fs.readdirSync(startPath);
        for(var i=0;i<files.length;i++){
            var filename=path.join(startPath,files[i]);
            var stat = fs.lstatSync(filename);
            if (stat.isDirectory()){
                fromDir(filename,filter,callback);
            }
            else if (filter.test(filename)) callback(filename);
        };
    };

module.exports = router;