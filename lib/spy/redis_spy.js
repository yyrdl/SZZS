
/**
 * Created by ZJ on 2015/8/27.
 */
var tools=require("../tool");
var infoCollector=require("../collector");

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
            }
            var record={
                "type":"redis",
                "host_ip":tools.localIPV4Adress,
                "host_name":tools.hostName,
                "server_ip":self.address.split(":")[0],
                "server_port":self.address.split(":")[1],
                "command":command,
                "parameter":parameter,
                "isError":false,
                "error":"",
                "time_cost":0,
                "dest":self.address
            };
            var s_start=Date.now();
            function cb(err,res)
            {
                err&&(record.isError=true,record.error=err.message?err.message:err.toString());
                record.time_cost=(Date.now()-s_start);
                tools.realAsync(record,infoCollector.collect);
                origin_cb&&((typeof origin_cb)==='function')&&(origin_cb(err,res));
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