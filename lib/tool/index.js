/*
* Created by ZJ on 2015/8/27
* */


var realAsync=function (data,cb){
    process.nextTick(function(){
        cb(data);
    });
};

var IP_tool=require("./getIP.js");

exports.realAsync=realAsync;

exports.getLocalIPAdress=IP_tool.getLocalIPAdress;
exports.getClientIP=IP_tool.getClientIP;
