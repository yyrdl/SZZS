

var Spy=require("../spy");
var BOX=require("../sendor").MsgBox;

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

var module=require("module");
var origin_load=module._load;

module._load=function(){
    var module_name=arguments[0];
    var origin_module=origin_load.apply(this,arguments);
    if(targetModules[module_name]&&targetModules[module_name].done==false)
    {
        origin_module=targetModules[module_name].spy(origin_module);
        targetModules[module_name].done=true;//防止重复包装
    }
    return origin_module;
}

exports.MsgBox=BOX;
