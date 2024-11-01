//require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const listingRoutes = require('./routes/listingRoutes');
const accountRoutes = require('./routes/accountRoutes');
const mongoose = require('mongoose');
const {upload} = require('./middleware/fileUpload')



//create app
const app = express();


//configure app
let port = 4000;
let host = 'localhost';
let url = "mongodb://localhost:27017/NinerBay";
app.set('view engine', 'ejs');

//connect to database
mongoose.connect(url)
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


//set up routes
app.get('/', (req, res)=>{
    res.render('index');
});

app.use('/listings', listingRoutes);

app.use('/accounts', accountRoutes);


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
