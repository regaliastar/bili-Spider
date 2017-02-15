var http = require('http'),
	fs = require('fs'),
	async = require('async'),
	cheerio = require('cheerio'),
	request = require('request');

var av_num = 0,
	not_found = 0,
	url = "http://bangumi.bilibili.com/anime/",
	av_all = [];


function fetchPage(url,callback) {
	setTimeout(function(){
		startRequest(url);
		console.log('正在抓取：'+url);
	},100); 
	
    callback(null);
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
				if(is404($)){
					//添加处理代码
					not_found++;
					console.log('找不到网页');
					return;
				}else{
					var info_title = $('h1[class=info-title]').text().trim(),
						info_count = $('.info-count-item-play').children().last().text().trim(),
						info_fans = $('.info-count-item-fans').children().last().text().trim(),
						info_review = $('.info-count-item-review').children().last().text().trim();
					//writeFile(html,'myHtml');
					saveImg($,info_title);

					var av_item = {
						info_title: info_title,
						info_count: info_count.toNumber(),
						info_fans: info_fans.toNumber(),
						info_review: info_review.toNumber(),
						url: x
					};

					console.log(av_item);
					appendFile(JSON.stringify(av_item),"test");
				}

			})

	}).on('error',function(err){
		console.log(err);
	})
}

function writeFile(txt,filename){
	fs.exists('./text/'+filename+'.txt',function(exist){
		if(exist){
			console.log(filename+' 文件已存在');
		}else{
			fs.writeFile('./text/'+filename+'.txt',txt,'utf-8',function(err){
				if(err){
					throw err;
				}
			})
		}
	})
	
}

function appendFile(txt,filename){
	fs.appendFile('./text/'+filename+'.txt',txt,'utf-8',function(err){
		if(err){
			throw err;
		}
	})
}

/**
 *先判断图片是否存在，
 *若存在，打印一条信息；
 *若不存在，则请求图片并保存到本地
 *
 */
function saveImg($,filename){
	let part = $('.bangumi-preview').children().first().attr('src');

	//console.log('img_src: '+img_src);
	if(!part){
		console.log("不存在该图片");
		return;
	}else{
		let img_src = 'http:'+ part;
		fs.exists('./img/'+filename+'.jpg',function(exist){
			if(exist){
				console.log(filename+' 图片已存在');
			}else{
				request.head(img_src,function(err,res,body){
					if(err){
						console.log(err);
					}
				});
				request(img_src).pipe(fs.createWriteStream('./img/'+filename+'.jpg'));
			}
		})
	}

}

function is404($){
	let code = $('.errmsg').children().length;
	if(code){
		return true;
	}else{
		return false;
	}
}

 String.prototype.toNumber = function(){
	if(!this){
		console.log('-1');
		return -1;
	}else{
		let t = this.Trim();
		var reg = /[\u4e00-\u9fa5]/g;

		if(t.indexOf('万') !== -1){
			return t.replace(reg,'')*10000;
		}else if(t.indexOf('亿') !== -1){
			return t.replace(reg,'')*100000000;
		}else{
			return t;
		}
		
	}
}

//去除空格
String.prototype.Trim = function() { 
	return this.replace(/\s+/g, ""); 
} 

function main(){
	var urls = [];
	for(let i = 3000;i<4000;i++){
		urls.push(url+i);
	}

	async.mapLimit(urls,5,function(url,callback){
		fetchPage(url,callback);
		av_num++;
	},function(err,result){
		console.log(result);
	});
	

}

main();