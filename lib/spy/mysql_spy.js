/**
 * Created by ZJ on 2015/8/25.
 *
 */
var infoCollector=require("../sendor");
var tools=require("../tool");

function addSpy(mysql){

    var origin_createConnection=mysql.createConnection;
    var origin_createPool=mysql.createPool;
    //var origin_createPoolCluster=mysql.createPoolCluster;
    mysql.createConnection=function(){
      //to do .收集设置信息
        var options=arguments[0];
        var conn=origin_createConnection.apply(this,arguments);
        var orgin_query=conn.query;

        conn.query=function()
        {
            var sql=arguments[0];
            var parameter=arguments[1];
            var ori_cb=arguments[2];
            var record={
                "type":"mysql",
                "host":options.host,
                "port":options.port||3306,
                "database":options.database,
                "timecost":"",
                "sql":"",
                "parameter":"",
                "isError":false,
                "error":""
            };
            record.sql=sql;
            record.parameter=parameter;
            var s_start=Date.now();
            var s_end="";
            function cb(err,res){
                //请求已经返回，记录时间等信息
                if(err){
                    record.isError=true;
                    record.error=err;
                }
                s_end=Date.now();
                record.timecost=(s_end-s_start)/1000;
                tools.realAsync(record,infoCollector.collect);
                if(ori_cb&&(typeof ori_cb)=="function")
                {
                    ori_cb(err,res);
                }
            }
            var args=[sql,parameter,cb];
            orgin_query.apply(this,args);
        }
        return conn;
    }

    mysql.createPool=function(){
        var options=arguments[0];
        //记录创建的连接池的设置

        var ori_pool=origin_createPool.apply(this,arguments);
        var ori_query=ori_pool.query;

        ori_pool.query=function(){
            var sql=arguments[0];
            var parameter=arguments[1];
            var ori_cb=arguments[2];
            var record={
                "type":"mysql",
                "host":options.host,
                "port":options.port||3306,
                "database":options.database,
                "timecost":"",
                "sql":"",
                "parameter":"",
                "isError":false,
                "error":""
            };
            record.sql=sql;
            record.parameter=parameter;
            var s_start=Date.now();
            var s_end="";
            function cb(err,res){
                //请求已经返回，记录时间等信息
                s_end=Date.now();
                record.timecost=(s_end-s_start)/1000;
                if(err)
                {
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
            ori_query.apply(this,args);
        }

        return ori_pool;
    }


    //createPoolCluster 暂时不加探针
    /*
    mysql.createPoolCluster=function(){

    }
    */

    return mysql;
}
exports.addSpy=addSpy;