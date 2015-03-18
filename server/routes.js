var express = require('express');
var router = express.Router();

/*
 * POST to user.
 */
router.post('/user', function(req, res) {
    var db = req.db;
    db.collection('user').insert(req.body, function(err, result){
        res.send(err);
    });
});


/*
 * GET to user by id.
 */
router.get('/user/:userId', function(req, res) {
    var db = req.db;
    db.collection("user").findOne({id:req.params.userId},  function(err, doc){
    		if (doc !== null) {
    			res.json(doc);
    		} else {
    			res.json({"id" : null});
    		}
    });
});

/*
* POST to messages.
*/
router.post('/messages', function(req, res) {
    var db = req.db;
    db.collection('messages').insert(req.body, function(err, result){
        res.json(result);
    });
});


/*
 * GET to messages by id.
 */
router.get('/messages/:id', function(req, res) {
    var db = req.db;
    db.collection('messages').find({toId:req.params.id}).toArray(function(err, docs){
        res.json(docs);
    });
});


/*
* DELETE to messages.
*/
router.delete('/messages/:id', function(req, res) {
    var db = req.db;
    db.collection('messages').remove({message_id : req.params.id}, function(err, result) {
        //Deleted correctly
    });
});


/*
* POST to news.
*/
router.post('/news', function(req, res) {
    var db = req.db;
    db.collection('news').insert(req.body, function(err, result){
        res.json(result);
    });
});

/*
 * GET to news by id.
 */
router.get('/news/:id', function(req, res) {
    var db = req.db;
    db.collection('news').find().limit(5).sort({_id:0}).toArray(function(err, docs){
        res.json(docs);
    });
});

/*
 * GET to news.
 */
router.get('/news', function(req, res) {
    var db = req.db;
    db.collection('news').find().limit(5).sort({_id:0}).toArray(function(err, docs){
        res.json(docs);
    });
});

/*
* DELETE to deletenews.
*/
router.delete('/news/:id', function(req, res) {
    var db = req.db;
    db.collection('news').remove({news_id : req.params.id}, function(err, result) {
        //Deleted correctly
    });
});

/*
* GET to cities
*/
router.get('/cities/:name', function(req, res) {
    var db = req.db;
    db.collection('cities').findOne({name:req.params.name}, function(err, docs){
        res.json(docs);
    });
});

/*
* GET to cities
*/
router.get('/cities', function(req, res) {
    var db = req.db;
    db.collection('cities').find().toArray(function(err, docs){
        res.json(docs);
    });
});
/*
* POST to cities.
*/
router.post('/cities/:name', function(req, res) {
    var db = req.db;
    db.collection('cities').insert(req.body, function(err, result){
        res.json(result);
    });
});

/*
* PUT to cities.
*/
router.put('/cities/:name', function(req, res) {
    var db = req.db;
    db.collection('cities').update({name:req.params.name}, {'$set':{mark:req.body.mark, votes:req.body.votes}}, function(err, result) {
        res.json(result);
    });
});

/*
* GET to votes
*/
router.get('/votes/:userId', function(req, res) {
    var db = req.db;
    db.collection('votes').find({userId:req.params.userId}).toArray(function(err, docs){
        res.json(docs);
    });
});

/*
* POST to votes.
*/
router.post('/votes/:userId', function(req, res) {
    var db = req.db;
    db.collection('votes').insert(req.body, function(err, result){
        res.json(result);
    });
});

module.exports = router;