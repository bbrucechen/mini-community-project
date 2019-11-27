const express = require('express');
const path = require('path');
const router = require('./router.js');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

app.engine('html',require('express-art-template'));
app.use('/public',express.static(path.join(__dirname,'./public/')));
app.use('/node_modules',express.static(path.join(__dirname,'./node_modules/')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(session({
	secret:'keyboard cat',
	resave:false,
	saveUninitialized:true
}))

app.use(router);

app.listen(80,() => {
	console.log('running...');
})
