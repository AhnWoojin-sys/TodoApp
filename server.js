const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const CrptoJS = require('crypto-js');

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
app.use(session({secret: 'secretCode', resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

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

app.get('/login', (req, res)=>{
    res.render('login.ejs');
})

app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), (req, res)=>{
    res.redirect('/');
})

app.get('/register', (req, res)=>{
    res.render('register.ejs');
})

app.post('/register', (req, res, next)=>{
    if(req.body.pw == req.body.confirmPassword){
        db.collection('login').findOne({id : req.body.id})
        .then(result => {
            if(result === undefined) {
                db.collection('login').insertOne({
                    firstName : req.body.firstName,
                    lastName : req.body.lastName,
                    email : req.body.email,
                    id : req.body.id,
                    password : req.body.pw
                    },(error, result)=>{
                        res.redirect('/login');
                })
            }
            else {
                res.redirect('/register');
            }
        })
    }
})

app.get('/mypage', checkLogin,(req, res)=>{
    res.render('mypage.ejs');
})

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (inputId, inputPw, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: inputId}, function (error, result) {
    if (error) return done(error)

    if (!result) return done(null, false, { message: '존재하지 않는 아이디래요' })
    if (inputPw === result.pw) {
      return done(null, result)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

passport.serializeUser((user, done)=>{
    done(null, user.id);
});

passport.deserializeUser((user, done)=>{
    done(null, {});
});

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

function checkLogin(req, res, next){
    if(req.user){
        next()
    } else {
        req.send("You did not login");
    }
}