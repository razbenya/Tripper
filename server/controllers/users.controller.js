var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var url = require('url');


// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.post('/getUsers', getUsers);
router.post('/getPopularUsers', getPopularUsers);
router.post('/search', search);
router.get('/', getAll);
router.get('/current', getCurrent);
router.put('/follow/:_id', follow);
router.put('/unfollow/:_id', unfollow);
router.put('/:_id', update);
router.delete('/:_id', _delete);
router.get('/:_id', getUser);

module.exports = router;

function update(req, res) {
    if (req.user.sub == req.params._id) {
        userService.update(req.params._id, req.body)
            .then(() => {
                res.sendStatus(200);
            }).catch((err) => {
                res.status(400).send(err);
            });
    } else {
        res.status(401).send("Unauthorized");
    }

}

function getUsers(req, res) {
    userService.getUsersByIds(req.body)
        .then((users) => {
            res.send(users);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getPopularUsers(req, res) {
    var parts = url.parse(req.url, true);
    var params = parts.query;
    var limit = parseInt(params.limit);
    userService.getPopularUsers(req.body, limit)
        .then((users) => {
            res.send(users);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
}

function search(req, res) {
    let query = req.body.query;
    userService.search(query)
        .then((users) => {
            res.send(users);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
}

function authenticate(req, res) {
    userService.authenticate(req.body.email, req.body.password)
        .then(function (user) {
            if (user) {
                // authentication successful
                res.send(user);
            } else {
                // authentication failed
                res.status(400).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function register(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    userService.getAll()
        .then(function (users) {
            res.send(users);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getUser(req, res) {
    userService.getById(req.params._id)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function getCurrent(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function follow(req, res) {
    userService.follow(req.params._id, req.body._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function unfollow(req, res) {
    userService.unfollow(req.params._id, req.body._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function _delete(req, res) {
    userService.delete(req.params._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}