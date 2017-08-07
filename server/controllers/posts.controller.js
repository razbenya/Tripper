var config = require('config.json');
var express = require('express');
var url = require('url');
var router = express.Router();
var postService = require('services/post.service');
var userService = require('services/user.service');
// routes
router.post('/publish', newPost);
router.post('/members', getMembers);
router.post('/like/:_id', like);
router.post('/unlike/:_id',unlike);
router.post('/comment/:_id',comment);
router.get('/', getAll);
router.get('/myPosts', myPosts);
router.get('/feedPosts', feedPosts);
router.get('/:_id', getById);
router.get('/getPopularPosts', getPopular);
router.delete('/:_id', _delete);


module.exports = router;

function getById(req, res) {
    postService.getById(req.params._id)
        .then((post) => {
            res.send(post);
        }).catch(err => {
            res.status(400).send(err);
        });
}

function getPopular(req, res){
    var parts = url.parse(req.url, true);
    var params = parts.query;
    var limit  = parseInt(params.limit);
    postService.getPopular(limit)
        .then((posts) => {
            res.send(posts);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
}

function comment(req, res){
    postId = req.params._id;
    comment = req.body;
    postService.addComment(postId, comment)
        .then(() => {
            res.sendStatus(200);
        }).catch(err => {
            res.status(400).send(err);
        });
}

function like(req, res) {
    user = req.body;
    postId = req.params._id;
    postService.addLike(postId, user._id)
        .then(() => {
            userService.addToLikes(user._id)
                .then(() => {
                    res.sendStatus(200);
                }).catch(err => {
                    res.status(400).send(err);
                });
        }).catch(err => {
            res.status(400).send(err);
        });
}

function unlike(req, res) {
    user = req.body;
    postId = req.params._id;
    postService.removeLike(postId, user._id)
        .then(() => {
            userService.removeFromLikes(user._id)
                .then(() => {
                    res.sendStatus(200);
                }).catch(err => {
                    res.status(400).send(err);
                });
        }).catch(err => {
            res.status(400).send(err);
        });
}

function getMembers(req, res) {
    userService.getPostMembers(req.body)
        .then((users) => {
            res.send(users);
        }).catch(err => {
            res.status(400).send(err);
        });
}

function myPosts(req, res) {
    var parts = url.parse(req.url, true);
    var params = parts.query;
    userService.getById(params._id)
        .then((user) => {
            postService.getPosts(parseInt(params.startIndex), parseInt(params.limit), [params._id], user.taggedPosts)
                .then((posts) => {
                    res.send(posts);
                }).catch((err) => {
                    res.status(400).send(err);
                });
        }).catch(err => {
            res.status(400).send(err);
        });
}

function feedPosts(req, res) {
    var parts = url.parse(req.url, true);
    var params = parts.query;
    userService.getById(params._id)
        .then((user) => {
            var userList = user.following;
            userList.push(user._id);
            postService.getPosts(parseInt(params.startIndex), parseInt(params.limit), userList, user.taggedPosts)
                .then((posts) => {
                    res.send(posts);
                }).catch((err) => {
                     concolse.log(err);
                    res.status(400).send(err);
                })
        }).catch((err) => {
            res.status(400).send(err);
        });
}

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
                }).catch((err) => {
                    res.status(400).send(err);
                });
        }).catch((err) => {
            res.status(400).send(err);
        });
}