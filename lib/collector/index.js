/*
 * Created by ZJ on 2015/8/27
 * */

var events=require("events");
var tool=require("../tool").filter;
var the_msg_box=new events.EventEmitter();

exports.collect=function(info){
    var f_info=tool.filter(info);
    (f_info!==null)&&(the_msg_box.emit("message",f_info));
};
exports.MsgBox=the_msg_box;