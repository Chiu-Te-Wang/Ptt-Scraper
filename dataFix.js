var fs = require('fs');

var foodArr = [];
var foodArr2 = [];
var kinds = "Instant_Food";

//------code for merge two json files---------------
// fs.readFile('./ptt_'+kinds+'.json',function(err, data){
// 	if(err){
// 		console.log('Error: read file error!!');
// 		throw err;
// 	}

// 	else{
// 		foodArr = JSON.parse(data.toString());
        
//         fs.readFile('./ptt_'+kinds+'2.json',function(err, data){
//             if(err){
//                 console.log('Error: read file error!!');
//                 throw err;
//             }

//             else{
//                 foodArr2 = JSON.parse(data.toString());
//                 for(var i = 0; i<foodArr2.length; i++){
//                 foodArr.push(foodArr2[i]);
//                 }

//                 fs.writeFile('ptt_'+kinds+'a.json',JSON.stringify(foodArr),function(err){
//                                     if(err){
//                                         console.log('Write file failed!');
//                                         throw err;
//                                     }
//                                     console.log('Data saved!!  length: ' + foodArr.length);
//                                 });
//             }
//         });

// 	}
// });

//----code for remove deleted or error article------

fs.readFile('./ptt_'+kinds+'.json',function(err, data){
 if(err){
     console.log('Error: read file error!!');
     throw err;
 }

 else{
     foodArr = JSON.parse(data.toString());
     for(var i = 0; i<foodArr.length;i++){
        if(foodArr[i].content === "error" || foodArr[i].content === ""){
            foodArr.splice(i,1);
        }
     }
     fs.writeFile('ptt_'+kinds+'a.json',JSON.stringify(foodArr),function(err){
                                    if(err){
                                        console.log('Write file failed!');
                                        throw err;
                                    }
                                    console.log('Data saved!!  length: ' + foodArr.length);
                                });
        

 }
});


