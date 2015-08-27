/*
* Created by ZJ on 2015/8/27
* */

var util=require("util");
var events=require("events");
var the_msg_box;

function MsgSendor(){
    events.EventEmitter.call(this);
}

util.inherits(MsgSendor, events.EventEmitter);


the_msg_box=new MsgSendor();


exports.collect=function(info){

    var meg=JSON.stringify(info);
    the_msg_box.emit("message",meg);
}
exports.MsgBox=the_msg_box;