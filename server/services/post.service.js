var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });

db.bind('posts');
db.posts.createIndex({ "$**": "text" });

var service = {};

service.publish = publish;
service.getAll = getAll;
service.delete = _delete;
service.getById = getById;
service.getPosts = getPosts;
service.addLike = addLike;
service.removeLike = removeLike;
service.addComment = addComment;
service.getPopular = getPopular; 
service.update = update;
service.search = search;

module.exports = service;

function search(query){
    var deferred = Q.defer();
    var allData = query.split(" ");
    var data = [];
    data = allData;
    var str = data.join(" ");
    //create unique data array
    /*
    $.each(allData, function(i, el){
        if($.inArray(el, data) === -1) data.push(el);
    });*/
    console.log(data);
    //search words
    db.posts.find(
        { $text: { $search: str } },
        { score: { $meta: "textScore" } })
        .sort( { score: { $meta: "textScore" } } )
        .toArray(function (err, posts) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(posts);
        });
    return deferred.promise;

}

function getAll() {
    var deferred = Q.defer();
    db.posts.find().toArray(function (err, posts) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(posts);
    });
    return deferred.promise;
}

function update(_id, newpost) {
    var deferred = Q.defer();
    toUpdate = {
        title: newpost.title,
        taggedUsers: newpost.taggedUsers,
        location: newpost.location,
        data: newpost.data
    }
    db.posts.update(
        {_id: mongo.helper.toObjectID(_id) },
        {$set: toUpdate }, (err, doc) => {
              if (err) deferred.reject(err.name + ': ' + err.message);
              deferred.resolve();
         });
        return deferred.promise;;
}


function getPopular(startIndex, limit){
    var deferred = Q.defer();
    db.posts.find()
            .sort({ likesNum: -1 })
            .skip(startIndex)
            .limit(limit)
            .toArray((err, posts) => {
                if(err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve(posts);
            });
    return deferred.promise;
}

function addComment(postId, comment){
    var deferred = Q.defer();
    db.posts.update(
        {_id: mongo.helper.toObjectID(postId) },
        {$addToSet: {comments: comment }}, (err, doc) => {
            if (err) 
                deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });
        return deferred.promise;
}

function addLike(postId, userId) {
    var deferred = Q.defer();
    db.posts.update(
        {_id: mongo.helper.toObjectID(postId) },
        {$addToSet: {likes: userId },
        $inc: { likesNum: 1} }, 
        (err, doc) => {
            if (err) 
                deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });
        return deferred.promise;
}

function removeLike(postId, userId){
     var deferred = Q.defer();
    db.posts.update(
        {_id: mongo.helper.toObjectID(postId)},
        {$pull: {likes: userId},
        $inc: { likesNum: -1} }, 
        (err, doc) => {
            if (err) 
                deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
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