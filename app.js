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


// Display's all user posts
app.get('/blog/user', (req,res) => {
    // console.log('test get');

    let userid = 1;
    db.any('SELECT id, post, userid, entrydatetime FROM posts WHERE userid = $1', [userid])
        .then((results) => {
            // console.log(results);

            res.render('userblog', {posts: results});
        })
        .catch((err) => {
            console.log(err);
        });
    });



// Renders specific post page for update
app.get('/blog/update/:id', (req,res) => {
    let id = req.params.id;

    // res.render('updatePost', {postEntry: id});

    db.any('SELECT id, post, userid, entrydatetime FROM posts WHERE id = $1', [id])
        .then((result) => {
            // res.send(result);   // [{"id":22,"post":"test post 9","userid":1,"entrydatetime":"2018-11-06T00:08:20.365Z"}]
            res.render('updatePost', {postEntry: result});
        })
        .catch((err) => {
            console.log(err)
        });
});




// Update changes to specific post
app.post('/blog/update/:id', (req,res) => {
    // res.send("test");

    let id = req.params.id;
    let newPostUpdate = req.body.post;

    db.one('UPDATE posts SET post = $1 WHERE id = $2 RETURNING (id)', [newPostUpdate, id])
    .then((result) => {
        console.log(result.id);
        res.redirect('/blog/user');
    })
    .catch( (err) => {
        console.log(err)
    });  

    // res.send(newPostUpdate);

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


// app.post('/blog/delete', (req,res) => {
//     // console.log(req.body);   // { id: '16' }

//     let id = req.body.id;
//     db.none('DELETE FROM posts WHERE id = $1', [id])
//         .then(() => {
//             res.redirect('/blog/user')
//         })
//         .catch( (err) => {
//             console.log(err)
//         });
// });


// Delete user post
app.post('/blog/delete/:id', (req,res) => {
    // console.log(req.body);   // { id: '16' }

    let id = req.params.id;
    db.none('DELETE FROM posts WHERE id = $1', [id])
        .then(() => {
            res.redirect('/blog/user')
        })
        .catch( (err) => {
            console.log(err)
        });
});







app.listen(3000, ()=> {
    console.log('Server started');
});


