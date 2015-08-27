/*
* Created by ZJ on 2015/8/25
* */

//应该引入一个发送所采集的数据用的工具
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
            "host":options.host,
            "port":options.port,
            "path":options.path,
            "headers":options.headers,
            "method":options.method,
            "timecost":"",
            "isError":false,
            "error":""
        }
        var request_Start="";
        var request_end="";
        function cb(fb){
            if(origin_cb&&(typeof origin_cb)=="function")
            {
                origin_cb(fb);
            }
            fb.on("error",function(err){
                //to do 捕获了error，如何处理？记录发送的结束时间
                request_end=(new Date()).getTime();
                record.isError=true;
                record.error=err;
                record.timecost=(request_end-request_Start)/1000;
                tools.realAsync(record,infoCollector.collect);
            });

            fb.on("end",function(){
                //to do 表示数据已经接收完.记录发送的返回时间
                request_end=(new Date()).getTime();
                record.timecost=(request_end-request_Start)/1000;
                tools.realAsync(record,infoCollector.collect);
            });
        };
        var args=[options,cb];
        var ret=origin_request.apply(this,args);
        var origin_end=ret.end;
        ret.end=function(){
            //to do 表示请求设置结束，请求开始发送. 这里记录发送的开始时间
            request_Start=(new Date()).getTime();
            origin_end.apply(this);
        }
        return ret;
    };

    // http server

    http.createServer=function(){
        var origin_cb=arguments[0];
        var record={
            "type":"http_server",
            "host":"",
            "port":"",
            "timecost":"",
            "req_url":"",
            "req_method":"",
            "res_statuscode":"",
            "isError":false,
            "error":""
        };
        var h_start="";
        var h_end="";
        function cb(req,res){

            record.req_url=req.url;
            record.method=req.method;

            req.on("end",function(){
                //接收数据完成 需要记录些什么数据？？？
                h_start=(new Date()).getTime();
            });
            req.on("error",function(err){
                //接收数据出现错误
                h_start=(new Date()).getTime();
            });
            var origin_end=res.end;
            res.end=function(){
                //to do .server端回复完毕
                h_end=(new Date()).getTime();
                record.res_statuscode=res.statusCode;
                record.timecost=(h_end-h_start)/1000;
                tools.realAsync(record,infoCollector.collect);
                return origin_end.apply(this,arguments);
            }
            if(origin_cb&&(typeof origin_cb)=="function")
            {
                origin_cb(req,res);
            }
        };
        var args=[cb];
        return origin_createServer.apply(this,args);
    }

    return http;
}

exports.addSpy=addSpy;