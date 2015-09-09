
/**
 * Created by ZJ on 2015/8/27.
 */
var tools=require("../tool");
var infoCollector=require("../sendor");
//重写他的createClient方法
function addSpy(redis){
  var origin_createClient=redis.createClient;
    redis.createClient=function(){
        var client=origin_createClient.apply(this,arguments);
        var origin_send_command=client.send_command;
        client.send_command=function(){
            var self=this;
            var command=arguments[0];
            var parameter=arguments[1];
            var origin_cb=arguments[2];

            if (Array.isArray(parameter)) {
                if (typeof origin_cb === "function") {

                } else if (! origin_cb) {
                    var last_arg_type = typeof parameter[parameter.length - 1];
                    if (last_arg_type === "function" || last_arg_type === "undefined") {
                        origin_cb = parameter.pop();
                    }
                } else {
                    throw new Error("send_command: last argument must be a callback or undefined");
                }
            } else {
                throw new Error("send_command: second argument must be an array");
            };

            var record={
                "type":"redis",
                "command":command,
                "args":parameter,
                "isError":false,
                "error":"",
                "time_cost":0,
                "database_address":self.address
            };
            var s_start=Date.now();
            function cb(err,res)
            {
                var s_end=Date.now();
                record.time_cost=s_end-s_start;
                if(err)
                {
                    record.isError=true;
                    record.error=err.message;
                }
                tools.realAsync(record,infoCollector.collect);
                if(origin_cb&&(typeof origin_cb)=="function")
                {
                    origin_cb(err,res);
                }
            }
            var args=[command,parameter,cb];
            var ret=origin_send_command.apply(self,args);
            if(ret!==undefined)
            {
                return ret;
            }
        }
        return client;
    }
    return redis;
}


exports.addSpy=addSpy;