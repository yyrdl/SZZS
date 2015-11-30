/*
* Created by ZJ on 2015/8/25
* */

var infoCollector=require("../collector");
var tools=require("../tool");

function addSpy(http){
    var origin_request=http.request;
    var origin_createServer=http.createServer;

    //http client
    http.request=function(){
        var options=arguments[0];
        var origin_cb=arguments[1];
        var record={
            "type":"http_client",
            "host_ip":tools.localIPV4Adress,
            "hots_port":tools.hostName,
            "server_ip":options.host,
            "server_port":options.port,
            "path":options.path,
            "headers":options.headers,
            "method":options.method,
            "time_cost":"",
            "isError":false,
            "error":"",
            "dest":options.path
        };
        var request_Start=0;
        function cb(res){
            res.on("error",function(err){
                record.isError=true;
                record.error=err.message?err.message:err.toString();
                record.time_cost=(Date.now()-request_Start);
                tools.realAsync(record,infoCollector.collect);
            });

            res.on("end",function(){
                record.time_cost=(Date.now()-request_Start);
                tools.realAsync(record,infoCollector.collect);
            });
            if(origin_cb&&(typeof origin_cb)=="function")
            {
                origin_cb(res);
            }
        };

        var args=[options,cb];
        var ret=origin_request.apply(this,args);
        var origin_end=ret.end;
        ret.end=function(){
            request_Start=Date.now();
            origin_end.apply(this,arguments);
        }
        ret.on("error",function(err){
            record.isError=true;
            record.error=err.message;
            record.time_cost=(Date.now()-request_Start);
            tools.realAsync(record,infoCollector.collect);
        });
        return ret;
    };

    // http server

    http.createServer=function(){
        var origin_cb=arguments[0];
        var record={
            "type":"http_server",
            "host_ip":tools.localIPV4Adress,
            "host_name":tools.hostName,
            "port":"",
            "client_ip":"",
            "time_cost":"",
            "dest":"",
            "req_method":"",
            "res_statuscode":"",
            "isError":false,
            "error":""
        };

        function cb(req,res){
            var h_start="";
            record.dest=req.url;
            record.req_method=req.method;
            record.client_ip=tools.getClientIP(req);
            req.on("end",function(){
                h_start=Date.now();
            });

            var origin_end=res.end;
            res.end=function(){
                record.res_statuscode=res.statusCode;
                record.time_cost=(Date.now()-h_start);
                tools.realAsync(record,infoCollector.collect);
                return origin_end.apply(this,arguments);
            }
            if(origin_cb&&(typeof origin_cb)=="function")
            {
                origin_cb(req,res);
            }
        };
        var args=[cb];
        var server=origin_createServer.apply(this,args);
        var origin_listen=server.listen;
        server.listen=function(){
            record.port=arguments[0];
            return origin_listen.apply(this,arguments);
        };
        return server;
    }
    return http;
}

exports.addSpy=addSpy;