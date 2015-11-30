/**
 * Created by zj on 2015/11/30.
 */
var config={};
exports.config=function(conf){
    config=conf;
};
exports.filter=function(info){
    var result={"type":info.type,"time_cost":info.time_cost,"isError":""};
    result.isError=(info.isError!==undefined?info.isError:false);
    for(var p in config[info.type]){
       result[p]=config[info.type][p].value!==null?config[info.type][p].value:info[p];
    }
    return config[info.type]!==undefined?result:null;
}