const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
// if our client placed on another domain, we can response from our server
const cors = require('cors');
// HTTP request logger middleware for node.js
const morgan = require('morgan');
const keys = require('./config/keys');
const app = express();

mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true})
    //The section useNewUrlParser: true is added because the MongoDB Node.js driver rewrote the tool it uses
    // to parse MongoDB connection strings. Because this is such a big change, they put the new connection
    // string parser behind a flag.
    //The section useCreateIndex: true is similar. It is to deal with MongoDB deprecating the ensureIndex() function.
    .then(() => console.log('MongoDB connected'))
    .catch(error => console.log(error));

app.use(passport.initialize());
require('./middleware/passport')(passport);

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads')); // to get access to the images in the folder "uploads"
app.use(cors());
// to parse all data we get from client
app.use(bodyParser.urlencoded({extended: true}));
// to convert json to js objects
app.use(bodyParser.json());

const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const categoryRoutes = require('./routes/category');
const orderRoutes = require('./routes/order');
const positionRoutes = require('./routes/position');

app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/position', positionRoutes);

// only for production assembly
if(process.env.NODE_ENV === 'production') {
    // make folder client as static
    app.use(express.static('client/dist/crm-client'));

    // for all raw get requests server send index.html
    app.get('*', (req, res) => {
        res.sendFile(
            path.resolve(
                __dirname, 'client', 'dist', 'crm-client', 'index.html'
            )
        )
    });
}

module.exports = app;
