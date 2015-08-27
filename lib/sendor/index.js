/*
* Created by ZJ on 2015/8/27
* */

var fs=require("fs");

/*
var for_http=function(data){

}

var for_mysql=function(data){

}

var for_pg=function(data){

}
*/
exports.collect=function(info){

    var meg=JSON.stringify(info);
    fs.appendFile("./logInfo.log",meg+"\n",function(err){

    });
}