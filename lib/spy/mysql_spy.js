/**
 * Created by ZJ on 2015/8/25.
 *
 */
var infoCollector=require("../collector");
var tools=require("../tool");

function addSpy(mysql){

    var origin_createConnection=mysql.createConnection;
    var origin_createPool=mysql.createPool;
    //var origin_createPoolCluster=mysql.createPoolCluster;
    mysql.createConnection=function(){

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
                "host_ip":tools.localIPV4Adress,
                "host_name":tools.hostName,
                "server_ip":options.host,
                "server_port":options.port||3306,
                "database":options.database,
                "time_cost":"",
                "sql":"",
                "parameter":"",
                "isError":false,
                "error":"",
                "dest":""
            };
            record.dest=record.server_ip+":"+record.server_port+"/"+record.database;
            record.sql=sql;
            record.parameter=parameter;
            var s_start=Date.now();
            function cb(err,res){
                err&&( record.isError=true,record.error=err.message?err.message:err.toString());
                record.time_cost=(Date.now()-s_start);
                tools.realAsync(record,infoCollector.collect);
                ori_cb&&((typeof ori_cb)==='function')&&(ori_cb(err,res));
            }
            var args=[sql,parameter,cb];
            orgin_query.apply(this,args);
        }
        return conn;
    }

    mysql.createPool=function(){
        var options=arguments[0];
        var ori_pool=origin_createPool.apply(this,arguments);
        var ori_query=ori_pool.query;

        ori_pool.query=function(){
            var sql=arguments[0];
            var parameter=arguments[1];
            var ori_cb=arguments[2];
            var record={
                "type":"mysql",
                "host_ip":tools.localIPV4Adress,
                "host_name":tools.hostName,
                "server_ip":options.host,
                "server_port":options.port||3306,
                "database":options.database,
                "time_cost":"",
                "sql":"",
                "parameter":"",
                "isError":false,
                "error":"",
                "dest":""
            };
            record.dest=record.server_ip+":"+record.server_port+"/"+record.database;
            record.sql=sql;
            record.parameter=parameter;
            var s_start=Date.now();
            function cb(err,res){
                err&&( record.isError=true,record.error=err.message?err.message:err.toString());
                record.time_cost=(Date.now()-s_start);
                tools.realAsync(record,infoCollector.collect);
                ori_cb&&((typeof ori_cb)==='function')&&(ori_cb(err,res));
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