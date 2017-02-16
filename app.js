var Spider = require('./spider'),
    express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    pkg = require('./package'),
    handlebars = require('express3-handlebars').create({
	partialsDir:"views/partials"
});

var app = express();

//设置模板目录
app.set('views',path.join(__dirname,'views'));
//设置模板引擎
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

app.use(bodyParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname,'public')));


//捕获错误代码并返回错误界面
app.use(function (err, req, res, next) {
	log.error('error:'+err);
  res.render('error', {
    error: err
  });
});

if (module.parent) {
  module.exports = app;
} else {
  // 监听端口，启动程序
  app.listen(3000, function () {
    console.log(`${pkg.name} listening on port 3000`);
  });
}

Spider.start();