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



app.get('/', (req,res) => {
    res.send('Login/Registration Page');
});

app.get('/blog/user', (req,res) => {

    let userid = 1;
    db.any('SELECT id, post, userid, entrydatetime FROM posts WHERE userid = $1', [userid])
        .then((posts) => {
            res.render('userblog', {posts: posts});
        })
        .catch((err) => {
            console.log(err);
        });
    });


app.post('/blog/user', (req,res) => {

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


