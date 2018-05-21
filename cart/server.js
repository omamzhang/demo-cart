/**
 * 描述: 静态服务
 * 时间：2016年12月
 */
const path = require('path'),
	express = require('express'),
	proxy = require("express-http-proxy"),
	compress = require('compression'),
	app = express(),
	fs = require('fs'),
	config = require('./package.json'),
	projectName = "",
	port = process.env.PORT || '9091'

// GZIP压缩
app.use(compress());

// 设置响应头
app.use(function(req, res, next) {
	res.header('X-Powered-By', 'Express');
	res.header('Access-Control-Allow-Origin', '*');
	next();
})

// 当前静态项目的资源访问
app.use('/h5' + projectName, express.static(__dirname));
 
// 首页内容
app.get('/', function(req, res, next) {
	res.header('Cache-Control', 'no-cache')
	res.header('Content-Type', 'text/html; charset=UTF-8')
	res.end(projectName + ' 静态服务')
})

// 静态服务器监听
app.listen(port, '0.0.0.0', function() {
	console.log('static server running at ' + port)
})