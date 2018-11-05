const express = require('express');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');
const pgp = require('pg-promise')();

const app = express();

app.use(express.static('css'));
app.use(bodyParser.urlencoded({extended: false}));

app.engine('mustache', mustacheExpress());
app.set('views','./views');
app.set('view engine', 'mustache');

const connectionString = "postgres://localhost:5432/dcblog"
const db = pgp(connectionString)


// Will have login/registration
app.get('/', (req,res) => {
    res.send('Login/Registration Page');
    // After login in user should be redirected to thei page
    // res.redirect('/blog/user');
});

app.get('/blog/user', (req,res) => {
    // console.log('test get');

    let userid = 1;
    db.any('SELECT id, post, userid, entrydatetime FROM posts WHERE userid = $1', [userid])
        .then((posts) => {
            // console.log(posts);

            res.render('userblog', {posts: posts});
        })
        .catch((err) => {
            console.log(err);
        });
    });

// Handle new posts to be added and redirect
app.post('/blog/user', (req,res) => {
    // console.log('test post');
    // console.log(req.body);          // { post: 'test post' }

    let post = req.body.post;

    db.one('INSERT INTO posts (post, userid) VALUES ($1, $2) RETURNING (id)', [post, 1])
        .then((result) => {
            console.log(result.id);
            res.redirect('/blog/user');
        })
        .catch( (err) => {
            console.log(err)
        });
});



app.listen(3000, ()=> {
    console.log('Server started');
});


