var config = require('config.json');
var express = require('express');
var router = express.Router();
var fs = require('fs');
const uuidv1 = require('uuid/v1');

// routes
router.post('/uploads/:_id', uploadImg);
router.post('/delete', deleteImg);

module.exports = router;



function uploadImg(req, res) {
console.log(req.body.image);
    if (req.files) {
        let img = req.files.image;
        let id = req.params._id;
        img.name = uuidv1() + id + img.name;
        img.mv('uploads/' + img.name, function (err) {
            if (err)
                return res.status(500).send(err);
            res.send(img.name);
        });
    } else if(req.body.image.startsWith('data')){
        let index = req.body.image.indexOf(',');
        let id = req.params._id;
        var base64Data = req.body.image.substr(index+1);
        console.log(base64Data);
       //var base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, "");
        var name = uuidv1() + "-"+id + '-profilePic.jpg';
        fs.writeFile('uploads/'+name, base64Data, 'base64', function (err) {
            if(err){
                  return res.status(400).send('No files were uploaded.');
            } else {
                res.send(name);
            }
        });
    }else {
         return res.status(400).send('No files were uploaded.');
    }
}

function deleteImg(req, res) {
    var path = req.body.path;
    fs.unlink("./uploads/" + path, (err) => {
        if (err) {
            return res.status(400).send(err);
        } else {
            res.send('ok !');
        }
    });
}