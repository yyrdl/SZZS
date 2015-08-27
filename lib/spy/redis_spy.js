
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
            var record={
                "type":"redis",
                "command":command,
                "args":parameter,
                "isError":false,
                "error":"",
                "timecost":0,
                "database_address":self.address
            };
            var s_start=Date.now();
            function cb(err,res)
            {
                var s_end=Date.now();
                record.timecost=s_end-s_start;
                if(err)
                {
                    record.isError=true;
                    record.error=err;
                }
                tools.realAsync(record,infoCollector.collect);
                if(origin_cb&&(typeof origin_cb)=="function")
                {
                    origin_cb(err,res);
                }
            }
            var args=[command,parameter,cb];
            var ret=origin_send_command.apply(this,args);
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