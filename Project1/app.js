//require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const listingRoutes = require('./routes/listingRoutes');


//create app
const app = express();


//configure app
let port = 4000;
let host = 'localhost';
app.set('view engine', 'ejs');


//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));


//set up routes
app.get('/', (req, res)=>{
    res.render('index');
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

//start the server
app.listen(port, host, ()=>{
    console.log('Server is running on port', port);
})