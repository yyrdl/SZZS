

var Spy=require("../spy");
var BOX=require("../collector").MsgBox;
var filter=require("../tool").filter;
var targetModules={
    "http":{
        "spy":Spy.httpSpy,
        "done":false
    },
    "pg":{
        "spy":Spy.pgSpy,
        "done":false
    },
    "mysql":{
        "spy":Spy.mysqlSpy,
        "done":false
    },
    "redis":{
        "spy":Spy.redisSpy,
        "done":false
    }
};

var _module=require("module");
var origin_load=_module._load;

_module._load=function(){
    var module_name=arguments[0];
    var origin_module=origin_load.apply(this,arguments);
    if(targetModules[module_name]&&!targetModules[module_name].done)
    {
        origin_module=targetModules[module_name].spy(origin_module);
        targetModules[module_name].done=true;//防止重复包装
    }
    return origin_module;
}
function exceptModules(config){
    var tar={
           "http":true,
           "pg":true,
           "redis":true,
           "mysql":true
        };
    for(var p in config){
        if(p=='http_client'||p=="http_server"){
            tar.http=false;
        }else{
            (tar[p]!==undefined)&&(tar[p]=false);
        }
    }
    for(var q in tar){
        targetModules[q]["done"]=tar[q];
    }
}
module.exports={
    "config":function(config){
        exceptModules(config);//通过用户配置，去除那些不用监听的模块
        filter.config(config);
        return this;
    },
    "on":function(event_key,cb){
       BOX.on(event_key,cb);
    },
    "promiseProxy":function(){

    },
    "generalProxy":function(){

    }
};
