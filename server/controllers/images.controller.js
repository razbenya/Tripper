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
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    let img = req.files.image;
    let id = req.params._id;
    img.name = uuidv1() + id + img.name;
    img.mv('uploads/' + img.name, function (err) {

        if (err)
            return res.status(500).send(err);
        res.send(img.name);
    });
}

function deleteImg(req, res) {
    var path = req.body.path;
    fs.unlink("./uploads/"+path , (err) => {
        if (err) {
            return res.status(400).send(err);
        } else {
            res.send('ok !');                                
        }
});
}