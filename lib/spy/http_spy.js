/*
* Created by ZJ on 2015/8/25
* */

var infoCollector=require("../sendor");
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
            "server_ip":options.host,
            "port":options.port,
            "path":options.path,
            "headers":options.headers,
            "method":options.method,
            "time_cost":"",
            "isError":false,
            "error":""
        };
        var request_Start=0;
        var request_end=0;
        function cb(res){
            res.on("error",function(err){
                //to do 捕获了error，如何处理？记录发送的结束时间
                request_end=Date.now();
                record.isError=true;
                record.error=err;
                record.time_cost=(request_end-request_Start);
                tools.realAsync(record,infoCollector.collect);
            });

            res.on("end",function(){
                //to do 表示数据已经接收完.记录发送的返回时间
                request_end=Date.now();
                record.time_cost=(request_end-request_Start);
                tools.realAsync(record,infoCollector.collect);
            });
            if(origin_cb&&(typeof origin_cb)=="function")
            {
                origin_cb(fb);
            }
        };

        var args=[options,cb];
        var ret=origin_request.apply(this,args);
        var origin_end=ret.end;
        ret.end=function(){
            //to do 表示请求设置结束，请求开始发送. 这里记录发送的开始时间
            request_Start=Date.now();
            origin_end.apply(this,arguments);
        }
        ret.on("error",function(err){
            request_end=Date.now();
            record.isError=true;
            record.error=err;
            record.time_cost=(request_end-request_Start);
            tools.realAsync(record,infoCollector.collect);
        });
        return ret;
    };

    // http server

    http.createServer=function(){
        var origin_cb=arguments[0];
        var record={
            "type":"http_server",
            "host":tools.getLocalIPAdress(),
            "port":"",
            "client_ip":"",
            "time_cost":"",
            "req_url":"",
            "req_method":"",
            "res_statuscode":"",
            "isError":false,
            "error":""
        };

        function cb(req,res){
            var h_start="";
            var h_end="";
            record.req_url=req.url;
            record.req_method=req.method;
            record.client_ip=tools.getClientIP(req);
            req.on("end",function(){
                //接收数据完成 需要记录些什么数据？？？
                h_start=Date.now();
            });

            var origin_end=res.end;
            res.end=function(){
                //to do .server端回复完毕
                h_end=Date.now();
                record.res_statuscode=res.statusCode;
                record.time_cost=(h_end-h_start);
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