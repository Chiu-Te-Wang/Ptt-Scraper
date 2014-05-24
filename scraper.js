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
var pages = 38;//496
var scrapLoopNum = 1;
//need to put in worker dyno and set setTimeout

var pttLimit = 29;
var divider = parseInt(pages/pttLimit);
var remain  = pages - divider*pttLimit;
console.log("divider is " + divider);
console.log("remain is " + remain);
var recurCount = 0;//use in function scrapeContent

var whileCount = 0;
async.series([
	function(callback1){
		setTimeout(function(){
			//findNewestPage();
			newestIdex = 2699;
			callback1();
		},3000);
	},

	function(callback1){
		setTimeout(function(){
			loopScrape();
			callback1();
		},0);
	}

],function(err,re){
	if(err){console.log("err: from outer " + err);}
});




//----------------------------functions-------------------------------
function findNewestPage(){//get the newest pages number
	request(newPage,function(err,res,html){
	if(!err && res.statusCode === 200){
		var $ = cheerio.load(html);
		var a = $('.btn-group.pull-right').children('.btn.wide').eq(1);
		newestIdex = parseInt(a.attr('href').replace(/(\/|bbs|Food|index|\.html)/gm,""))+1;
		console.log("newestIdex in findNewestPage : "+newestIdex);
	}
});
}

function Scraper4Auto(out_Cout){
	if(out_Cout<parseInt((pages-remain)/pttLimit)){
		 console.log("enter Scraper4Auto!!!! " + out_Cout);
		setTimeout(function(){
			async.series([
				function(callback){
					setTimeout(function(){
						console.log("ctw " + out_Cout);
						if(!(newestIdex === 0)){
							_Scraper4Auto(out_Cout,0);
						}
						out_Cout++;
						callback();
					},0);
				},

				function(callback){
					setTimeout(function(){
						Scraper4Auto(out_Cout);
						callback();
					},0);
					
				}
			
			],function(err){});
		},5000);
	}
	else{//out of for loop
				 console.log("out of out_Cout!!!");
	}
}

function _Scraper4Auto(out_Cout,inner_Count){
	if(inner_Count<pttLimit){
		 console.log("pages "+(newestIdex-inner_Count-pttLimit*out_Cout-remain)+" done? "+(inner_Count+pttLimit*out_Cout+remain) + " @@ "+parseCounter);
		setTimeout(function(){
			scrapeFunc((newestIdex-pttLimit*out_Cout-inner_Count-remain),(inner_Count+pttLimit*out_Cout+remain),"_Scraper4Auto");
			inner_Count++;
			 console.log("---------in _Scraper4Auto!!!");
			 console.log("newestIdex in _Scraper4Auto : "+newestIdex);
			_Scraper4Auto(out_Cout,inner_Count);
		},5000+inner_Count*10);
	}
	else{//out of for loop
		 console.log("=======out of _Scraper4Auto!!!");
	}
}

function Scraaper4Remain(num){
	if(num<remain){
		setTimeout(function(){
			async.series([
				function(callback){
					setTimeout(function(){
						scrapeFunc(newestIdex-num,num,"Scraaper4Remain");
						callback();
					},0);
				},

				function(callback){
					setTimeout(function(){
						console.log("pages "+(newestIdex-num)+" done "+num + " @@ "+parseCounter);
						console.log("newestIdex in Scraaper4Remain : "+newestIdex);
						num++;
						callback();
					},0);
				},

				function(callback){
					setTimeout(function(){
						Scraaper4Remain(num);
						callback();
					},0);
				}],function(err){});
		},5000)
	}
	else{
		//out of loop 
	}
}

function scrapeFunc(index,status,who){ //status means newest comming(first page)
	var web = 'http://www.ptt.cc/bbs/Food/index'+index+'.html';
	console.log(web);
	request(web,function(err,res,html){
		if(!err && res.statusCode === 200){
			var $ = cheerio.load(html);
			if(status === 0){
				particleNum = $('div.r-ent').length; 
				console.log("1st: "+particleNum);
			}	
			//scrape Func
			_scrapeFunc(0,html,who);
		}
	});
}

function scrapeContent(URL,content,who){
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
						console.log(who + " Scrape : "+ URL);
						recurCount = 0;
						console.log("call scrapeContent!!");
			}
			else{
				//contentCounter++;
				recurCount++;
				//console.log("recurCount: "+recurCount);
				if(recurCount<5){
					//console.log('try: '+recurCount);
					setTimeout(scrapeContent(URL,content,who),1500+recurCount);
					console.log("call scrapeContent!! rere");
				}
				else
				{//Error : 503 or 500 or 404
					contentCounter++;
					if(res){
						console.log("err: " + res.statusCode+" URL = "+URL);
					}
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
			    	console.log('newestIdex: '+newestIdex);
			    	newestIdex = newestIdex - pages;
			    	parseCounter = 0;
			    	contentCounter = 0;
			    });
}




function _scrapeFunc(num,html,who){
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
								scrapeContent(contentURL,content,who);
								// console.log('content is :' + content[0]);
								setTimeout(function(){callback();},3000);
							},1000);
						},

						//save as json type
						two: function(callback){
							setTimeout(function(){
								metaData = {
									tag: true,
									title: title.replace(/(\t|\n)/gm,""),
									date: date.replace(/(\t|\n| )/gm,""),
									content: content[0].replace(/(\t|\n| )/gm,"")
								};

								parsedResults.push(metaData);
								console.log(parseCounter+"  "+date.replace(/(\t|\n| )/gm,"") + " c: "+contentCounter);
								parseCounter++;
								if((parseCounter === (particleNum + (pages-1)*20) || parseCounter >= (particleNum + (pages-5)*20)) 
									&& (parseCounter<(particleNum + (pages-1)*20))){ 
							    //ptt has 20 articles per page
								    if(parseCounter === (particleNum + (pages-1)*20)){
										writeData();
									}
									else{
										writeData();
										parseCounter = (particleNum + (pages-1)*20)+5;
									}

								}

								num++;
								_scrapeFunc(num,html,who);
								callback();
							},500);
						}},
						function(err,results){
							if(err){console.log("err : "+err);}
						});
					},1000);
	}
}

function loopScrape(){
			if(whileCount < scrapLoopNum){
				setTimeout(function(){
					async.series([
						function(callback3){
							setTimeout(function(){
								//scrape first page
								if(!(newestIdex === 0)){
									Scraaper4Remain(0);
									setTimeout(callback3(null),200);
								}
								
							},2000);
						},

						function(callback3){
							setTimeout(function(){
								//scrape other pages
								Scraper4Auto(0);
								setTimeout(callback3(null),200);
							},2000);
						},

						function(callback3){
							setTimeout(function(){
								console.log("!!##!! "+parseCounter);
								whileCount++;
								setTimeout(callback3(null),200);
							},2000);
					}],function(err,re){loopScrape();});
				},0);
		}
		else{
			//end loop 
			console.log("out of loop!!");
		}
	}