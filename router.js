const express = require('express');
const User = require('./model/user.js');
const Topic = require('./model/topic.js');
const md5 = require('blueimp-md5');

const router = express();

router.get('/',(req,res) => {
	Topic.find((err,data) => {
		if(err) {
			return res.end('Server Error');
		}
		let PageCode = [];
		let length = Math.ceil(data.length / 6);
		for(var i = 1;i <= length;i++) {
			PageCode.push(i);
		}
		data = data.slice(0,6);
		res.render('index.html',{user:req.session.user,topic:data,pageCode:PageCode});
	})
	
})

router.get('/page/choose',(req,res) => {
	const num = parseInt(req.query.num,10);
	console.log(num);
	const startNum = (num - 1) * 6;
	const endNum = startNum + 6;
	Topic.find((err,data) => {
		if(err) {
			return res.end('Server Error');
		}
		data = data.slice(startNum,endNum);
		res.json({topic:data});
	})
})

router.get('/register',(req,res) => {
	res.render('register.html');
})

router.post('/register',(req,res) => {
	let body = req.body;
	User.findOne({
		$or:[
			{
				email:body.email
			},
			{
				nickname:body.nickname
			}
		]
	},(err,data) => {
		if(err) {
			return res.status(500).json({
				err_code:500
			})
		}
		if(data) {
			return res.status(200).json({
				err_code:1,
			})
		}
		body.password = md5(md5(body.password));
		new User(body).save((err,data) => {
			if(err) {
				return res.status(500).json({
					err_code:500,
				})
			}
			req.session.user = data;
			return res.status(200).json({
				err_code:0,
			})
		})
	})
})

router.get('/login',(req,res) => {
	res.render('login.html');
})

router.post('/login',(req,res) => {
	let body = req.body;
	body.password = md5(md5(body.password));
	User.findOne({
		email:body.email,
		password:body.password
	},(err,data) => {
		if(err) {
			return res.status(500).json({
				err_code:500,
			})
		}
		if(!data) {
			return res.status(200).json({
				err_code:1,
			})
		}
		req.session.user = data;
		res.status(200).json({
			err_code:0,
		})
	})
})

router.get('/topics/new',(req,res) => {
	res.render('topic/new.html',{user:req.session.user});
})

router.post('/topics/new',(req,res) => {
	var body = req.body;
	new Topic(body).save((err,data) => {
		if(err) {
			return res.end('Server Error');
		}
		res.redirect('/');
	})
})

router.get('/topics/show',(req,res) => {
	Topic.findOne({_id:req.query.id},(err,data) => {
		if(err) {
			throw(err);
		}
		res.render('topic/show.html',{topic:data})
	})
})

router.get('/settings/profile',function(req,res) {

	res.render('settings/profile.html',{user:req.session.user});
})

router.post('/settings/profile',function(req,res) {
	var body = req.body;
	body.birthday = body.birthday + '';
	User.findByIdAndUpdate(req.session.user._id,body,function(err,data) {
		if(err) {
			return res.json({
				err_code:500
			})
		}
		req.session.user = data;
		console.log(req.session.user);
		res.json({
			err_code:0
		})
	})
})

router.get('/logout',(req,res) => {
	req.session.user = null;
	res.redirect('/');
})

module.exports = router;