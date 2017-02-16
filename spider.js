var http = require('http'),
fs = require('fs'),
async = require('async'),
cheerio = require('cheerio'),
request = require('request');

var not_found = 0,
	begin_req = 5000,	//5793
	max_req = 100,
	cur_req = 0,
	url = "http://bangumi.bilibili.com/anime/",
	av_all = [];


	function startRequest(x,callback){
		request.get(x,function(err,res){
			if(err){
				console.log(err);
				appendFile(err,'error');
			}
			console.log('正在抓取：'+x);

			var $ = cheerio.load(res.body);
			cur_req++;

				//统计出最受欢迎的番剧
				if(cur_req > max_req){
					
					console.log('统计出最受欢迎的番剧:');
				
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
					var info_title = $('h1[class=info-title]').text().trim()||'default',
					info_count = $('.info-count-item-play').children().last().text().trim()||'-1',
					info_fans = $('.info-count-item-fans').children().last().text().trim()||'-1',
					info_review = $('.info-count-item-review').children().last().text().trim()||'-1';
					//writeFile(html,'myHtml');
					//saveImg($,info_title);

					var av_item = {
						info_title: info_title,
						info_count: info_count.toNumber(),
						info_fans: info_fans.toNumber(),
						info_review: info_review.toNumber(),
						url: x
					};

					console.log(av_item);
					console.log('cur_req:'+cur_req);
					av_all.push(av_item);
					appendFile(JSON.stringify(av_item)+'\n',"test");
				}


			});

		callback(null);
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
	//console.log('appendFile');
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
 function saveImg($,fn){
 	let part = $('.bangumi-preview').children().first().attr('src');
 	let filename = fn.Trim();
	//console.log('img_src: '+img_src);
	if(!part){
		console.log("不存在该图片");
		return;
	}else{
		let img_src = 'http:'+ part;
		fs.exists('./public/img/'+filename+'.jpg',function(exist){
			if(exist){
				//console.log(filename+' 图片已存在');
			}else{
				request(img_src).pipe(fs.createWriteStream('./public/img/'+filename+'.jpg'));
			}
		});
	}

}

function is404($){
	//console.log('is404');
	let code = $('.errmsg').children().length;
	if(code){
		return true;
	}else{
		return false;
	}
}

String.prototype.toNumber = function(){
 	//console.log('toNumber');
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

 String.prototype.removeChinese = function(){
	//console.log('removeChinese');
	if(!this){
		return 'null';
	}else{
		let t = this.Trim();
		var reg = /[\u4e00-\u9fa5]/g;
		if(/.*[\u4e00-\u9fa5]+.*$/.test(t)){
			if(!t.replace(reg,'')){
				return Date.now()+''+Math.random();
			}else{
				return t.replace(reg,'');
			}
			
		}else{
			return t;
		}
	}
}

//去除所有特殊字符和空格
String.prototype.Trim = function() { 
	//console.log('Trim');
	return this.replace(/\s+/g, "").replace(/\//g,'').replace(/\\/g,'').replace(/\"/g,'').replace(/\?/g,'').replace(/:/g,'').replace(/\*/g,'').replace(/>/g,'').replace(/</g,'').replace(/\|/g,'');
}

//运行主程序
function main(){
	var avs = [];
	for(let i=begin_req;i<max_req+begin_req+1;i++){
		avs.push(url+i);
	}

	setTimeout(function(){
		async.mapLimit(avs,5,function(url,callback){
			startRequest(url,callback);
		},function(err,result){
			console.log('fin');
		});
	},2000);

}

exports.start = main;
