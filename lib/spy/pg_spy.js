/**
 * Created by ZJ on 2015/8/25.
 */

var infoCollector=require("../sendor");
var tools=require("../tool");

function addSpy(pg){
     var origin_client=pg.Client;
     var origin_query=origin_client.prototype.query;
     var origin_connect=pg.connect;

    //重写pg.Client类的query方法
    origin_client.prototype.query=function(){
        var self=this;
        var sql=arguments[0];
        var parameter=arguments[1];
        var ori_cb=arguments[2];
        var record={
            "type":"postgress",
            "host":self.host,
            "port":self.port,
            "database":self.database,
            "sql":sql,
            "parameter":parameter,
            "isError":false,
            "error":"",
            "timecost":""
        };
         //记录开始时间
        var s_start=(new Date()).getTime();

        function cb(err,res){
         //查询结束，记录结束时间
            var s_end=(new Date()).getTime();
            record.timecost(s_end-s_start)/1000;
            if(err){
                record.isError=true;
                record.error=err;
            }
            tools.realAsync(record,infoCollector.collect);
            if(ori_cb&&(typeof ori_cb)=="function")
            {
                ori_cb(err,res);
            }
        }
        var args=[sql,parameter,cb];
        var ret=origin_query.apply(this,args);
        if(ret!==undefined)
        {
            return ret;
        }
    };
    pg.Client=origin_client;

    pg.connect=function(){
        var configString=arguments[0];
        var ori_cb=arguments[1];
        var config=tools.PGConnectionParse(configString);

        function cb(err,client,done){
            var origin_query=client.query;
            var record={
                "type":"postgress",
                "host":config.host,
                "port":config.port,
                "database":config.database,
                "sql":"",
                "parameter":"",
                "isError":false,
                "error":"",
                "timecost":0,
            };
            client.query=function(){
                var sql=arguments[0];
                var parameter=arguments[1];
                var o_cb=arguments[2];
                record.sql=sql;
                record.parameter=parameter;
                var s_start=(new Date()).getTime();
                //开始查询，记录查询开始时间
                function cb2(er,res){
                    //查询结束，记录结束时间
                    var s_end=(new Date()).getTime();
                    record.timecost=(s_end-s_start)/1000;
                    if(err){
                        record.isError=true;
                        record.error=err;
                    }
                    tools.realAsync(record,infoCollector.collect);
                    if(o_cb&&(typeof o_cb)=="function")
                    {
                        o_cb(er,res);
                    }
                }
                var args=[sql,parameter,cb2];
                var rt=origin_query.apply(this,args);
                if(rt!==undefined)
                {
                    return rt;
                }
            }

            if(ori_cb&&(typeof ori_cb)=="function")
            {
                ori_cb(err,client,done);
            }
        }

        var args3=[configString,cb];
        var ret=origin_connect.apply(this,args3);
        if(ret!==undefined){
            return ret;
        }
    }

    return pg;
}

exports.addSpy=addSpy;