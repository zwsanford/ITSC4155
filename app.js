//require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const listingRoutes = require('./routes/listingRoutes');
const mongoose = require('mongoose');
const Card = require('./models/listingSchema');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');

//ewijoweijfoweij

//create app
const app = express();


//configure app
let port = 4000;
let host = 'localhost';
app.set('view engine', 'ejs');


//connect to database
mongoose.connect('mongodb://127.0.0.1:27017/demos')
.then(()=>{
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));

//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
//ijoijeoiefj
// This middleware function is used to manage sessions, 
// meaning data can be stored temporarily for each user (like remembering login status).   
app.use(session({
    //is a secret key used to secure the session data. It’s like a password 
    //that makes session data safe from tampering.  
       secret: 'wieowejfij232323ijofjeifj333',
    // This option stops the session from being saved back to the session store 
    // if nothing has changed. It’s a way to reduce the load on the server by not saving unchanged data.
       resave: false,
    // With this, a session is created even if it doesn’t have any data yet, 
    //which can help track users from their first visit.  
       saveUninitialized: false,
    // This sets a "cookie" (a small bit of data saved in the browser) that keeps the session
    // active for 1 hour (60 minutes * 60 seconds * 1000 milliseconds). After that, the session expires and the user would need to log in again.
       cookie: {maxAge: 60 *60*1000},
       store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/demos'})
    
    }));


//set up routes
app.get('/', (req, res)=>{
    res.render('index');
});


app.post('/', (req, res) => {
    // Create a new card document
    const newCard = new Card({

        // Using req.body or req.id gives you same thing.
        id: req.body.id,
        condition: req.body.condition,
        title: req.body.title,
        price: req.body.price,
        details: req.body.details,
        image: req.body.image,   
    });

    // Save the card to the database using .then() and .catch()
    newCard.save()
        .then(() => {
            res.redirect('/listings'); // Redirect to the /listings page if successful
        })
        .catch(error => {
            console.error('Error saving card:', error);
            res.status(500).send('Error saving card');
        });
});


app.use('/listings', listingRoutes);

app.use((req, res, next)=>{
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
})

app.use((err, req, res, next)=>{
    if(!err.status){
        err.status = 500;
        err.message = ("Internal Server error");
    }
    res.status(err.status);
    res.render('error', {error:err});
});

