var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });

db.bind('users');


var service = {};

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;
service.delete = _delete;
service.follow = follow;
service.unfollow = unfollow;
service.addPostToUser = addPostToUser;
service.removePostFromUser = removePostFromUser;
service.getPostMembers = getPostMembers;
service.addToLikes = addToLikes;
service.removeFromLikes = removeFromLikes;
service.getUsersByIds = getUsersByIds;
service.update = update;

module.exports = service;

function update(userId, params){
     var deferred = Q.defer();
     console.log(params);
     db.users.update(
         {_id: mongo.helper.toObjectID(userId)},
         {$set: params}, (err, doc) => {
              if (err) deferred.reject(err.name + ': ' + err.message);
              deferred.resolve();
         });
        return deferred.promise;;
}

function getPostMembers(post) {
    var deferred = Q.defer();
    var usersList = post.taggedUsers;
    usersList.push(post.userId);
    db.users.find(
        { _id: { $in: usersList } }
    ).toArray((err, users) => {
        if (err) deferred.reject(err.name + ': ' + err.message);
        users = _.map(users, function (user) {
            return _.omit(user, 'hash');
        });
        deferred.resolve(users);
    });
    return deferred.promise;
}

function getUsersByIds(usersList){
    var deferred = Q.defer();
    db.users.find(
        { _id: { $in: usersList } }
    ).toArray((err, users) => {
        if (err) deferred.reject(err.name + ': ' + err.message);
        users = _.map(users, function (user) {
            return _.omit(user, 'hash');
        });
        deferred.resolve(users);
    });
    return deferred.promise;
}

function addToLikes(userId){
     var deferred = Q.defer();
     console.log(userId);
      db.users.update( 
          { _id: mongo.helper.toObjectID(userId) },
          { $inc: { recivedLikes: 1 }}, (err, doc) => {
          
            if (err) 
                deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
          });
        return deferred.promise;
}

function removeFromLikes(userId){ 
     var deferred = Q.defer();
      db.users.update( 
          { _id: mongo.helper.toObjectID(userId) },
          { $inc: { recivedLikes: -1 }}, (err, doc) => {
            if (err) 
                deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
          });
        return deferred.promise;
}

function authenticate(email, password) {
    var deferred = Q.defer();
    db.users.findOne({ email: email }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (user && bcrypt.compareSync(password, user.hash)) {
            deferred.resolve({
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                posts: user.posts,
                followers: user.followers,
                following: user.following,
                taggedPosts: user.taggedPosts,
                likes: user.likes,
                profilePic: user.profilePic,
                recivedLikes: user.recivedLikes,
                token: jwt.sign({ sub: user._id }, config.secret)
            });
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();
    db.users.find().toArray(function (err, users) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        // return users (without hashed passwords)
        users = _.map(users, function (user) {
            return _.omit(user, 'hash');
        });
        deferred.resolve(users);
    });

    return deferred.promise;
}



function getById(_id) {
    var deferred = Q.defer();
    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findOne(
        { username: userParam.username },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                deferred.reject('Username "' + userParam.username + '" is already taken');
            } else {
                checkUniqueMail();
            }
        });

    function checkUniqueMail() {
        db.users.findOne(
            { email: userParam.email }, (err, user) => {
                if (err) {
                    deferred.reject(err.name + ":" + err.message);
                }
                if (user) {
                    deferred.reject('email "' + userParam.email + '" is already taken');
                } else {
                    createUser();
                }
            }
        )
    }


    function createUser() {

        userParam._id = mongo.helper.toObjectID(userParam.username);

        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');

        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);
        db.users.insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}


function follow(follower, toFollow) {
    var deferred = Q.defer();
    db.users.update(
        { _id: mongo.helper.toObjectID(follower) },
        { $push: { following: toFollow } }, (err, doc) => {
            if (err) deferred.reject(err.name + ': ' + err.message);
            updateFollowing();
        });
    function updateFollowing() {
        db.users.update(
            { _id: mongo.helper.toObjectID(toFollow) },
            { $push: { followers: follower } }, (err, doc) => {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
            });
    }
    return deferred.promise;
}


function unfollow(_id, toFollow) {
    var deferred = Q.defer();
    db.users.update(
        { _id: mongo.helper.toObjectID(_id) },
        { $pull: { following: toFollow } }, (err, doc) => {
            if (err) deferred.reject(err.name + ': ' + err.message);
            removeFollowing();
        });
    function removeFollowing() {
        db.users.update(
            { _id: mongo.helper.toObjectID(toFollow) },
            { $pull: { followers: _id } }, (err, doc) => {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
            });
    }
    return deferred.promise;
}


function removePostFromUser(publisherId, taggedUsers, _postId) {
    var deferred = Q.defer();
    db.users.update(
        { _id: mongo.helper.toObjectID(publisherId) },
        { $pull: { posts: _postId } },
        function (err, doc) {
            if (err)
                deferred.reject(err.name + ': ' + err.message);
            removeTaggedUser();
        });
    function removeTaggedUser() {
        db.users.update(
            { _id: { $in: taggedUsers } },
            { $pull: { taggedPosts: _postId } },
            { multi: true }, (err, doc) => {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
            });
    }
    return deferred.promise;
}


function addPostToUser(publisherId, taggedUsers, _postId) {
    var deferred = Q.defer();
    db.users.update(
        { _id: mongo.helper.toObjectID(publisherId) },
        { $push: { posts: _postId } },
        function (err, doc) {
            if (err)
                deferred.reject(err.name + ': ' + err.message);
            addToTaggedUser();
        });

    function addToTaggedUser() {
        db.users.update(
            { _id: { $in: taggedUsers } },
            { $push: { taggedPosts: _postId } },
            { multi: true }, (err, doc) => {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
            });
    }
    return deferred.promise;
}


function _delete(_id) {
    var deferred = Q.defer();
    db.users.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}