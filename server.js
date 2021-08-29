const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');

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
app.use('/public', express.static('public'));
app.use(methodOverride('_method'));

app.get('/', (req, res)=>{
    res.render('index.ejs');
})

app.get('/write', (req, res)=>{
    res.render('write.ejs');
})

app.get('/list', (req, res)=>{
    db.collection('post').find().toArray(function(error, result){
        res.render('list.ejs', { posts : result })
    })

})

app.get('/detail/:id', (req, res)=>{
    db.collection('post').findOne({_id : parseInt(req.params.id)}, (error, result)=>{
        res.render('detail.ejs', {data : result});
    })
})

app.get('/edit/:id', (req, res)=>{
    db.collection('post').findOne({_id : parseInt(req.params.id)}, (error, result)=>{
        if(error) console(error);
        res.render('edit.ejs', {data : result});
    })
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
                if(error)return console.log(error);
            })
            res.redirect('/list');
        });
    });
})

app.delete('/delete', (req, res)=>{
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, (error, result)=>{
        if(error)console.log(error);
        res.status(200).send({ message : 'Success'});
        console.log(result);
    });
});

app.put('/edit', (req, res)=>{
    db.collection('post').updateOne({_id: parseInt(req.body._id)}, { $set : {
        todo: req.body.todo,
        date: req.body.date
    }}, (error, result)=>{
        console.log(req.body)
        res.redirect('/list');
    })
    req.body._id = parseInt(req.body._id);
})