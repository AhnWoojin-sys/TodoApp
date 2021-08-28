const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb+srv://Ahnwoojin-sys:SwEZHk1TKnlCkWWI@cluster0.wybep.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", 
    function(error, client){
        if(error)return console.log(error);

        db = client.db('todoapp');

        app.listen('8080', function(){
            console.log('listening on 8080');
    });
})

var db;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');

app.get('/', (req, res)=>{
    res.sendfile(__dirname + '/index.html')
})

app.get('/write', (req, res)=>{
    res.sendFile(__dirname + '/write.html')
})

app.get('/list', (req, res)=>{
    db.collection('post').find().toArray(function(error, result){
        res.render('list.ejs', { posts : result })
    })

})

app.get('/detail/:id', (req, res)=>{
    res.render('detail.ejs', {});
})

app.post('/add', (req, res)=>{
    db.collection('counter').findOne({name: 'total'}, (error, result)=>{
        console.log(result.totalPost);
        var totalPost = result.totalPost;

        db.collection('post').insertOne({
            _id: (totalPost + 1),
            todo: req.body.todo,
            date: req.body.date
        }, (error, result)=>{
            db.collection('counter').updateOne({name: 'total'}, { $inc : {totalPost:1} }, (error, result)=>{
                console.log(result);
                if(error)return console.log(error);
            })
            res.redirect('/list');
        });
    });
})

app.delete('/delete', function(req, res){
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, (error, result)=>{
        if(error)console.log(error);
        res.status(200).send({ message : 'Success'});
        console.log(result);
    });
});