//import modules
import express from 'express';
import morgan from 'morgan';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import listingRoutes from './routes/listingRoutes.js';
import accountRoutes from './routes/accountRoutes.js';

// load env variables
import dotenv from 'dotenv';
dotenv.config();

//create app
const app = express();


//configure app
let port = 4000;
let host = 'localhost';
app.set('view engine', 'ejs');

//connect to database
mongoose.connect(process.env.DATABASE_URL)
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