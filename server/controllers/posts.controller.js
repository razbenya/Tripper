var config = require('config.json');
var express = require('express');
var router = express.Router();
var postService = require('services/post.service');
var userService = require('services/user.service');
// routes
router.post('/publish', newPost);
router.get('/', getAll);
router.delete('/:_id', _delete);

module.exports = router;

function newPost(req, res) {
    postService.publish(req.body)
        .then(() => {
            post = req.body;
            userService.addPostToUser(post.userId, post.taggedUsers, post._id)
                .then(() => {
                    res.sendStatus(200);
                }).catch(err => {
                    res.status(400).send(err);
                });
        }).catch((err) => {
            res.status(400).send(err);
        });

}

function getAll(req, res) {
    postService.getAll()
        .then(function (users) {
            res.send(users);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function _delete(req, res) {
    postService.getById(req.params._id)
        .then((post) => {
            userService.removePostFromUser(post.userId, post.taggedUsers, post._id)
                .then(() => {
                    postService.delete(req.params._id)
                        .then(() => {
                            res.sendStatus(200);
                        }).catch(err => {
                            res.status(400).send(err);
                        });
                }).catch(function (err) {
                    res.status(400).send(err);
                });
        }).catch(function (err) {
            res.status(400).send(err);
        });
}