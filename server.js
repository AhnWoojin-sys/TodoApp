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
    res.render('list.ejs');
})

app.post('/add', (req, res)=>{
    res.send('success');
    db.collection('post').insertOne(req.body, (error, result)=>{
        console.log(result);
    })
})
