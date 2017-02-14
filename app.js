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
				var info_title = $('h1[class=info-title]').text().trim();

				//writeFile(html,'myHtml');
				saveImg($,info_title);

				var av_item = {
					info_title: info_title,
					info_count: $('.info-count-item-play').text().trim(),
					info_fans: $('.info-count-item-fans').text().trim(),
					info_review: $('.info-count-item-review').text().trim()
				};

				console.log(av_item);

			})

	}).on('error',function(err){
		console.log(err);
	})
}

function writeFile(txt,filename){
	fs.writeFile('./text/'+filename+'.txt',txt,'utf-8',function(err){
		if(err){
			throw err;
		}
	})
}

function saveImg($,filename){
	var img_src = 'http:'+$('.bangumi-preview').children().first().attr('src');
	//console.log('img_src: '+img_src);
	request.head(img_src,function(err,res,body){
		if(err){
			throw err;
		}
	});
	request(img_src).pipe(fs.createWriteStream('./img/'+filename+'.jpg'));

}

fetchPage(url);