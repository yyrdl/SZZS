/**
 * Created by ZJ on 2015/8/25.
 */

var infoCollector=require("../sendor");
var tools=require("../tool");

function addSpy(pg){
     var origin_client=pg.Client;
     var origin_query=origin_client.prototype.query;

    //重写pg.Client类的query方法
    origin_client.prototype.query=function(){
        var self=this;
        var sql=arguments[0];
        var parameter=arguments[1];
        var ori_cb=arguments[2];
        var record={
            "type":"postgres",
            "host":self.host,
            "port":self.port,
            "database":self.database,
            "sql":sql,
            "parameter":parameter,
            "isError":false,
            "error":"",
            "time_cost":"",
            "dest":self.host+":"+self.port+"/"+self.database
        };
         //记录开始时间
        var s_start=Date.now();

        function cb(err,res){
         //查询结束，记录结束时间
            var s_end=Date.now();
            record.time_cost=(s_end-s_start);
            if(err){
                record.isError=true;
                record.error=err.message;
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

    //pg的连接池内部也是使用的pg.Client 所以只需要改pg.Client的原型即可
    return pg;
}

exports.addSpy=addSpy;