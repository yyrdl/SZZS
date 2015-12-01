

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
    "__box__":BOX,
    "config_data":"",
    "config":function(config){
        exceptModules(config);//通过用户配置，去除那些不用监听的模块
        filter.config(config);
        this.config_data=config;
        return this;
    },
    "on":function(event_key,cb){
       this.__box__.on(event_key,cb);
    },
    "promiseProxy":function(ori_method,config){
        var __self__=this;
        return function(){
            var start_time=Date.now(),
                args=arguments;
            var record={
                "type":config.type,
                "is_error":false,
                "error":"",
                "time_cost":0,
                "project_name":__self__.config_data.project_name
            };
            if(config.input) {
                record.parameter=Array.prototype.slice.apply(arguments);
            }
            return Promise.resolve().then(function(){
                return ori_method.apply(null,args);
            }).catch(function(err){
                record.is_error=true;
                record.error=err.message!==undefined?err.message:err.toString();
                record.time_cost=Date.now()-start_time;
                process.nextTick(function(){
                    __self__.__box__.emit("message",record);
                });
                throw err;
            }).then(function(result){
                record.time_cost=Date.now()-start_time;
                if(config.output)
                {
                    record.output=result;
                }
                process.nextTick(function(){
                    __self__.__box__.emit("message",record);
                });
                return result;
            });
        }
    },
    "generalProxy":function(ori_method,config){
        var __self__=this;
        return function(){
            var args=arguments,
                start_time=Date.now();
            var record={
                "type":config.type,
                "is_error":false,
                "error":"",
                "time_cost":0,
                "project_name":__self__.config_data.project_name
            };
            if(config.input){
                record.parameter=Array.prototype.slice.apply(arguments);
            }
            var output="",er="";
            try{
              output=ori_method.apply(null,args);
            }catch(err){
                er=err;
                record.is_error=true;
                record.error=err.message!==undefined?err.message:err.toString();
            }finally{
                record.time_cost=Date.now()-start_time;
                if(config.output&&!record.is_error){
                    record.output=output;
                }
                process.nextTick(function(){
                    __self__.__box__.emit("message",record);
                });
                if(record.is_error){
                    throw er;
                }else{
                    return output;
                }
            }
        }
    }
};
