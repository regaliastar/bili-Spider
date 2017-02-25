var http = require('http'),
	fs = require('fs'),
	async = require('async'),
	cheerio = require('cheerio'),
	requestHeader = require('./requestHeader'),
	file = require('./file'),
	request = require('request');


function parsePage(URL){
	var header = requestHeader(URL);
	request(header,function(err,res){
		if(err){
			console.log(err);
			return;
		}
		var $ = cheerio.load(res.body);
		file.writeFile(res.body,'html');

	}).on('error',function(err){console.log('error in request in parsePage');});

}


exports.parsePage = parsePage;


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
