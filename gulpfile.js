/**
 * 描述: H5构建脚本
 * 时间：2014年8月
 */
var gulp = require("gulp"),
	glob = require('glob'),
	fs = require('fs'),
	less = require("gulp-less"),
	clean = require("gulp-clean"),
	cssmin = require("gulp-cssmin"),
	// concat = require("gulp-concat"),
	uglify = require("gulp-uglify"),
	header = require("gulp-header"),
	rename = require('gulp-rename'),
	livereload = require('gulp-livereload'),
	gutil = require("gulp-util"), // 提示、报告错误
	plumber = require('gulp-plumber'), // 捕获错误
	moment = require("moment"),
	config = require("./package.json"),
	path = require("path"),
	watch = require('gulp-watch'),
	// realHash = require('gulp-hash'),
	// del = require('del'),
	// tap = require('gulp-tap'),
	// through2 = require('through2'),
	banner = '/*! <%= pkg.name %> - git - <%= moment().format("YYYY-MM-DD HH:mm:ss") %> */\r\n';
    

// 在文件头部添加时间戳等信息
var addHeader = function() {
	return header(banner, {
		pkg: config,
		moment: moment
	});
};

// less编译错误报告
var errorHandler = function(e) {
	// 控制台发声,错误时beep一下
	gutil.beep();
	gutil.log(e);
};

// 先清除老的CSS和JS压缩文件
gulp.task("cleanCss", function() {
	return gulp.src('css', {
		read: false
	}).pipe(clean());
});
gulp.task("cleanJs", function() {
	return gulp.src('js', {
		read: false
	}).pipe(clean());
});
 

// 编译less
 gulp.task("less", ["cleanCss"], function() {
 	gulp.src("less/*.less")
			.pipe(plumber({
				errorHandler: errorHandler
			}))
			.pipe(less())
			.pipe(cssmin())
			.pipe(gulp.dest("css"));
 });

// 独立js模块
gulp.task("js", ["cleanJs"], function() {

	gulp.src("jsdev/**/*.js")
		.pipe(plumber({
			errorHandler: errorHandler
		}))
		.pipe(uglify({
			mangle: true
		}))
		.pipe(gulp.dest("js")); 
	 
});

 

// 监听任务 自动执行LESS编译、拷贝和页面刷新功能
gulp.task("watch", function() {

	livereload.listen();

	// 使用rem布局的独立样式
	gulp.watch(["less/*.less", "!less/rem.base.less"], function(file) {
		gulp.src(file.path)
			.pipe(plumber({
				errorHandler: errorHandler
			}))
			.pipe(less())
			.pipe(gulp.dest("css"));
	});

 
	// rem基础样式
	gulp.watch("less/rem.base.less", function(file) {
		gulp.src(file.path)
			.pipe(less())
			.pipe(replace(/(\d)rem/g, "$1px*10")) // 单位转换
			.pipe(plumber({
				errorHandler: errorHandler
			}))
			.pipe(less())
			.pipe(gulp.dest("css"));
	});
 

	gulp.watch(['jsdev/*.js'], function(file) {
		gulp.src(file.path)
			.pipe(plumber({
				errorHandler: errorHandler
			}))
			.pipe(gulp.dest("js"));
	});

	// 监听有变化的css,js,ftl文件，自动刷新页面
	gulp.watch(['css/**/*.css', 'jsdev/**/*.js', 'html/**/*.html', (gutil.env.page || config.page) + '/**/*.ftl']).on('change', livereload.changed);

});

 
// 默认任务
gulp.task("default", ["less", 'js']);
