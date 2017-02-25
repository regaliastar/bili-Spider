var fs = require('fs');

exports.writeFile =	function(txt,filename){
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

exports.appendFile = function(txt,filename){
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
 exports.saveImg = function($,fn){
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