var request = require('request');
var cheerio = require('cheerio');
var fs      = require('fs');
var async   = require('async');

var parsedResults = [];
var parseCounter = 0;//for file system ,ensure pages be scrape
var contentCounter = 0;//for file system ,ensure contents be scrape
var particleNum = 0;
var newPage = 'http://www.ptt.cc/bbs/Food/index.html';
var newestIdex = 0;
var pages = 3;//496

//need to put in worker dyno and set setTimeout

var pttLimit = 2;
var divider = parseInt(pages/pttLimit);
var remain  = pages - divider*pttLimit;
console.log("divider is " + divider);
console.log("remain is " + remain);
var recurCount = 0;

var whileCount = 0;

findNewest();
async.whilst(
	function(){return (whileCount < 2);},
	function(callback){
		async.waterfall([
			function(callback1){
				setTimeout(function(){
				if(!(newestIdex === 0)){
					// for(var i = 0; i<remain;i++){
					// 	scrapeFunc(newestIdex-i,i);
					// 	console.log("pages "+(newestIdex-i)+" done "+i + " @@ "+parseCounter);
					// 	setTimeout(function(){},50);
					// }
					forSetTime3(0);
				}
				},2000);
				callback1(null);
			},

			function(callback1){
				forSetTime(0);
				callback1(null);
			},
		// for(var j = 0; j<parseInt((pages-remain)/pttLimit);j++){
		// 	console.log("enter j!!!! " + j);
		// 	(function(j){
		// 	setTimeout(function(){
		// 		console.log("ctw " + j);
		// 		if(!(newestIdex === 0)){
		// 			for(var i = 0; i<pttLimit;i++){
		// 				(function(i){
		// 				scrapeFunc((newestIdex-pttLimit*j-i-remain),(i+pttLimit*j+remain));
		// 				// console.log("pages "+(newestIdex-i-pttLimit*j-remain)+" done? "+(i+pttLimit*j+remain) + " @@ "+parseCounter);
		// 				setTimeout(function(){},500*i);
		// 				})(i);
		// 			}
		// 		}
		// 	},j*500);
		// 	})(j);
		// }
			function(callback1){
				setTimeout(function(){console.log("!!##!! "+parseCounter);},2000);
				whileCount++;
				newestIdex = newestIdex - (whileCount*(pages-1)*20+ pttLimit);
				
				callback1(null);
			}],function(err,results){
				if(err){console.log("err from waterfall: "+err);}
			}
		);
		setTimeout(callback,0);
	},
	function(err){
		if(err){
			console.log("Err: "+err);
		}
	}
);






//----------------------------functions-------------------------------
function findNewest(){//get the newest pages number
	request(newPage,function(err,res,html){
	if(!err && res.statusCode === 200){
		var $ = cheerio.load(html);
		var a = $('.btn-group.pull-right').children('.btn.wide').eq(1);
		newestIdex = parseInt(a.attr('href').replace(/(\/|bbs|Food|index|\.html)/gm,""))+1;
		console.log(newestIdex);
	}
});
}

function forSetTime(j){
	if(j<parseInt((pages-remain)/pttLimit)){
		 console.log("enter j!!!! " + j);
		setTimeout(function(){
			console.log("ctw " + j);
			if(!(newestIdex === 0)){
				forSetTime2(j,0);
			}
			j++;
			forSetTime(j);
		},5000);
	}
	else{//out of for loop
				 console.log("out of j!!!");
	}
}

function forSetTime2(j,i){
	if(i<pttLimit){
		 console.log("pages "+(newestIdex-i-pttLimit*j-remain)+" done? "+(i+pttLimit*j+remain) + " @@ "+parseCounter);
		setTimeout(function(){
			scrapeFunc((newestIdex-pttLimit*j-i-remain),(i+pttLimit*j+remain));
			i++;
			 console.log("---------in i!!!");
			forSetTime2(j,i);
		},5000+i*10);
	}
	else{//out of for loop
		 console.log("=======out of i!!!");
	}
}

function forSetTime3(num){
	if(num<remain){
		setTimeout(function(){
			scrapeFunc(newestIdex-num,num);
			console.log("pages "+(newestIdex-num)+" done "+num + " @@ "+parseCounter);
			num++;
			forSetTime3(num);
		},5000)
	}
	else{
		//out of loop 
	}
}

function scrapeFunc(index,status){ //status means newest comming(first page)
	var web = 'http://www.ptt.cc/bbs/Food/index'+index+'.html';
	console.log(web);
	request(web,function(err,res,html){
		if(!err && res.statusCode === 200){
			var $ = cheerio.load(html);
			if(status === 0){particleNum = $('div.r-ent').length; console.log("1st: "+particleNum);}
				// $('div.r-ent').each(function(i,element){
				// 	// parseCounter++;
				// 	var title = $(this).children('.title').text();
				// 	var date = $(this).children('.meta').children('.date').text();
				// 	var a = $(this).children('.title').children('a');
				// 	//scrape content
				// 	var contentURL = 'http://www.ptt.cc/' + a.attr('href');
				// 	var content = [''];
				// 	var metaData = {};
				// 	async.series({
				// 		one: function(callback){
				// 			setTimeout(function(){
				// 				recurCount = 0;
				// 			scrapeContent(contentURL,content);
				// 			console.log(content); 
				// 			},1000);
				// 			console.log('content is :' + content[0]);
				// 			setTimeout(function(){callback()},3000);
				// 		},

				// 		//save as json type
				// 		two: function(callback){
				// 			metaData = {
				// 				tag: true,
				// 				title: title.replace(/(\t|\n)/gm,""),
				// 				date: date.replace(/(\t|\n| )/gm,""),
				// 				content: content[0].replace(/(\t|\n| )/gm,"")
				// 			};
				// 			callback();
				// 		}},
				// 		function(err,results){

				// 			parsedResults.push(metaData);
				// 			console.log(parseCounter+"  "+date.replace(/(\t|\n| )/gm,"") + " c: "+contentCounter);
				// 			parseCounter++;
 
				// 			if(parseCounter === (particleNum + (pages-1)*20) 
				// 			   && contentCounter === (particleNum + (pages-1)*20)){ 
				// 			   //ptt has 20 articles per page
				// 				writeData();
				// 			}
				// 		});

				// });
_scrapeFunc(0,html);
		}
	});
}

function scrapeContent(URL,content){
	if(URL === 'http://www.ptt.cc/undefined'){
		//because the article be deleted ,so no URL 
		contentCounter++;
		content[0] = 'deleted';
	}
	else{
		request(URL,function(err,res,html){
			if(!err && res.statusCode === 200){
				var $ = cheerio.load(html);
				contentCounter++;
				content[0] = $('#main-content')
								.clone()
								.children('.article-metaline')
								.remove()
								.end()
								.children('.article-metaline-right')
								.remove()
								.end()
								.text()
								;
						console.log("Scrape : "+ URL);
						recurCount = 0;
			}
			else{
				//contentCounter++;
				recurCount++;
				//console.log("recurCount: "+recurCount);
				if(recurCount<5){
					//console.log('try: '+recurCount);
					setTimeout(scrapeContent(URL,content),1500+recurCount);
				}
				else
				{//Error : 503 or 500 or 404
					contentCounter++
					console.log("err: " + res.statusCode+" URL = "+URL);
					setTimeout(function(){},2000);
					recurCount = 0;
					content[0] = "error"
				}
				
			}
		});
	}
}

function writeData(){
		fs.writeFile('ptt_food.json',JSON.stringify(parsedResults),function(err){
			     	if(err){
			   			console.log('Write file failed!');
			    		throw err;
			    	}
			    	console.log('Data saved!!  length: ' + parsedResults.length+' count: '+contentCounter);
			    });
}




function _scrapeFunc(num,html){
	var $ = cheerio.load(html);
	// console.log("debugger : "+($('div.r-ent').length));
	if(num< $('div.r-ent').length){
		setTimeout(function(){
					// parseCounter++;
					var title = $('div.r-ent').eq(num).children('.title').text();
					var date =$('div.r-ent').eq(num).children('.meta').children('.date').text();
					var a = $('div.r-ent').eq(num).children('.title').children('a');
					//scrape content
					var contentURL = 'http://www.ptt.cc/' + a.attr('href');
					var content = [''];
					var metaData = {};
					async.series({
						one: function(callback){
							setTimeout(function(){
								recurCount = 0;
							scrapeContent(contentURL,content);
							},1000);
							// console.log('content is :' + content[0]);
							setTimeout(function(){callback();},3000);
						},

						//save as json type
						two: function(callback){
							metaData = {
								tag: true,
								title: title.replace(/(\t|\n)/gm,""),
								date: date.replace(/(\t|\n| )/gm,""),
								content: content[0].replace(/(\t|\n| )/gm,"")
							};
							callback();
						}},
						function(err,results){

							parsedResults.push(metaData);
							console.log(parseCounter+"  "+date.replace(/(\t|\n| )/gm,"") + " c: "+contentCounter);
							parseCounter++;
 
							if(parseCounter === (particleNum + (pages-1)*20) 
							   && contentCounter === (particleNum + (pages-1)*20)){ 
							   //ptt has 20 articles per page
								writeData();
							}

							if(err){console.log("err : "+err);}
						});
					num++;
					_scrapeFunc(num,html);
					},1000);
	}
}