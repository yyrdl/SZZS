/*
* Created by ZJ on 2015/8/27
* */


var realAsync=function (data,cb){
    process.nextTick(function(){
        cb(data);
    });
};

exports.realAsync=realAsync;
