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
router.post('/unlike/:_id', unlike);
router.post('/comment/:_id', comment);
router.post('/search', search);
router.get('/', getAll);
router.get('/myPosts', myPosts);
router.get('/feedPosts', feedPosts);
router.get('/getPopularPosts', getPopular);
router.get('/:_id', getById);
router.put('/update/:_id', update);
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

function update(req, res) {
    postService.getById(req.params._id).then(post => {
        if (req.user.sub == post.userId) {
            postService.update(req.params._id, req.body)
                .then(() => {
                    userService.updateTaggedUsers(req.params._id, req.body.toAdd, req.body.toRemove)
                        .then(() => {
                            res.sendStatus(200);
                        }).catch(err => {
                            res.status(400).send(err);
                        });
                }).catch(err => {
                    res.status(400).send(err);
                });
        } else {
            res.status(401).send("Unauthorized");
        }
    }).catch(err => {
        res.status(400).send(err);
    });

}

function search(req, res) {
    let query = req.body.query;
    postService.search(query)
        .then((posts) => {
            res.send(posts);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
}

function getPopular(req, res) {
    var parts = url.parse(req.url, true);
    var params = parts.query;
    var startIndex = parseInt(params.startIndex);
    var limit = parseInt(params.limit);
    postService.getPopular(startIndex, limit)
        .then((posts) => {
            res.send(posts);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
}

function comment(req, res) {
    if (req.user.sub == req.body.userId) {
        postId = req.params._id;
        comment = req.body;
        postService.addComment(postId, comment)
            .then(() => {
                res.sendStatus(200);
            }).catch(err => {
                res.status(400).send(err);
            });
    } else {
        res.status(401).send("Unauthorized");
    }
}

function like(req, res) {
    user = req.body;
    postId = req.params._id;
    if (req.user.sub == user._id) {
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
    } else {
        res.status(401).send("Unauthorized");
    }
}

function unlike(req, res) {
    user = req.body;
    postId = req.params._id;
    if (req.user.sub == user._id) {
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
    } else {
        res.status(401).send("Unauthorized");
    }
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
    if (req.user.sub == req.body.userId) {
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
    } else {
        res.status(401).send("Unauthorized");
    }

}


//for debuging
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
            if (post.userId == req.user.sub) {
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
            } else {
                res.status(401).send("Unauthorized");
            }
        }).catch((err) => {
            res.status(400).send(err);
        });
}