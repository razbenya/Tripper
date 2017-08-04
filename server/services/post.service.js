var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });

db.bind('posts');

var service = {};

service.publish = publish;
service.getAll = getAll;
service.delete = _delete;
service.getById = getById;
service.getPosts = getPosts;


module.exports = service;

function getAll() {
    var deferred = Q.defer();
    db.posts.find().toArray(function (err, posts) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(posts);
    });
    return deferred.promise;
}


function getPosts(startIndex,limit,userList,taggedList){
    var deferred = Q.defer();
    db.posts.find( {$or: [
        { userId: {$in: userList} },
        { _id: {$in: taggedList } }
    ]}).sort( [['_id', -1]] ).skip(startIndex).limit(limit)
        .toArray((err, posts) => {
            if(err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(posts);
        });
    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();
    db.posts.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
    db.posts.findById(_id, (err , post) => {
        if (err) 
            deferred.reject(err.name + ': ' + err.message);
        if(post){
            deferred.resolve(post);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
}


function publish(post) {
    var deferred = Q.defer();
    db.posts.insert(
        post,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });
    return deferred.promise;
}