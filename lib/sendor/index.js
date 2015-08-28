/*
* Created by ZJ on 2015/8/27
* */

var events=require("events");
var the_msg_box;


the_msg_box=new events.EventEmitter();

exports.collect=function(info){

    var meg=JSON.stringify(info);
    the_msg_box.emit("message",meg);
}
exports.MsgBox=the_msg_box;