var http = require('http'),
	fs = require('fs'),
	cheerio = require('cheerio'),
	request = require('request');

var i = 0,
	url = "http://bangumi.bilibili.com/anime/5793";


function fetchPage(x) {     //封装了一层函数
    startRequest(x); 
}


function startRequest(x){
	http.get(x,function(res){
		var html = '',
			title = [];

			res.setEncoding('utf-8');
			res.on('data',function(chunk){
				html += chunk;
			});

			//监听结束事件，即页面信息获取完毕
			res.on('end',function(){
				var $ = cheerio.load(html);
				var infoCount = $('span[class=info-count-item] :last-child').text().trim();

				var av_item = {
					title:$('h1[class=info-title]').text().trim(),
					infoCount:infoCount
				};

				console.log(av_item);

			})

	}).on('error',function(err){
		console.log(err);
	})
}



fetchPage(url);