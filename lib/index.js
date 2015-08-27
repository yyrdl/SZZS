
var module=require("module");
var Spy=require("./spy");

var targetModules={
    "http":Spy.httpSpy,
    "pg":Spy.pgSpy,
    "mysql":Spy.mysqlSpy
};

var origin_load=module._load;

module._load=function(){
    var module_name=arguments[0];
    var origin_module=origin_load.apply(this,arguments);
    if(targetModules[module_name])
    {
     origin_module=targetModules[module_name](origin_module);
    }
    return origin_module;
}