var http = require('http'),
	fs = require('fs'),
	async = require('async'),
	cheerio = require('cheerio'),
	request = require('request');

var not_found = 0,
	begin_req = 1000,	//5793
	max_req = 5000,
	cur_req = 0,
	url = "http://bangumi.bilibili.com/anime/",
	av_all = [];


function fetchPage(url,callback) {

	setTimeout(function(){
		startRequest(url);
		console.log('正在抓取：'+url);
	},1000); 

	//callback(null);
}


function startRequest(x){
	http.get(x,function(res){
		    setTimeout(function() {
       			res.emit('timeout');
    		}, 10000);

			var html = '';

			res.setEncoding('utf-8');
			res.on('data',function(chunk){
				html += chunk;
			});

			//自定义超时事件
			res.on('timeout',function(){
				//console.log(x+'请求超时','timeout');
				//appendFile(x+'请求超时'+'\n','timeout');
				res.destroy();
			});

			//监听结束事件，即页面信息获取完毕
			res.on('end',function(){
				var $ = cheerio.load(html);
				cur_req++;

				//统计出最受欢迎的番剧
				if(cur_req > max_req){
					av_all.sort(function(a,b){
						return b.info_count - a.info_count;
					});
					console.log('最受欢迎的番剧：'+JSON.stringify(av_all[0]));
					for(let i = 1;i<=10;i++){
						appendFile('第'+i+'受欢迎的番剧：'+JSON.stringify(av_all[i])+'\n','mostPopular');
					}
					
					return;
				}

				if(is404($)){
					//添加处理代码
					not_found++;
					console.log('找不到网页');
					appendFile('找不到网页'+x+'\n',"test");
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
					av_all.push(av_item);
					appendFile(JSON.stringify(av_item)+'\n',"test");
				}

			})

	}).on('error',function(err){
		console.log('error:'+err);
		appendFile('error'+err+'\n','error');
	})
}

function writeFile(txt,filename){
	fs.exists('./public/text/'+filename+'.txt',function(exist){
		if(exist){
			console.log(filename+' 文件已存在');
		}else{
			fs.writeFile('./public/text/'+filename+'.txt',txt,'utf-8',function(err){
				if(err){
					throw err;
				}
			})
		}
	})
	
}

function appendFile(txt,filename){
	fs.appendFile('./public/text/'+filename+'.txt',txt,'utf-8',function(err){
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
		fs.exists('./public/img/'+filename+'.jpg',function(exist){
			if(exist){
				console.log(filename+' 图片已存在');
			}else{
				request.head(img_src,function(err,res,body){
					if(err){
						console.log(err);
					}
				});
				request(img_src).pipe(fs.createWriteStream('./public/img/'+filename+'.jpg'));
			}
		});
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
		}else if(isNaN(t)){
			return -1;
		}else{
			return t;
		}
		
	}
}

//去除空格
String.prototype.Trim = function() { 
	return this.replace(/\s+/g, ""); 
}

//运行主程序
function main(){
	var DELIM = 100;
	for(let b=0;b<max_req/DELIM+1;b++){

		var urls = [];

		if(b === max_req/DELIM){
			for(let j=begin_req+b*DELIM;j<begin_req+b*DELIM+max_req%DELIM + 1;j++){
				urls.push(url+j);
			}
			//appendFile('if'+'\n','others');
		}else{
			for(let i = begin_req+b*DELIM;i<begin_req+b*DELIM+DELIM;i++){	//for(let i = begin_req;i<begin_req+max_req+1;i++){}
				urls.push(url+i);
			}
			//appendFile('else'+'\n','others');
		}

		//appendFile('b:'+b+'urls:'+urls+'\n','others');
		/*async.mapLimit(urls,1,function(url,callback){
			fetchPage(url,callback);
		},function(err,result){
			console.log('fin');
		});*/
		urls.map(function(url){
			fetchPage(url);
		});

	}
}

exports.start = main;
