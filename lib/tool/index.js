/*
* Created by ZJ on 2015/8/27
* */
var pg_string_parse=require("./pg_tool").parse;

var realAsync=function (data,cb){
    process.nextTick(function(){
        cb(data);
    });
};

var val = function(key, config, envVar) {
    if (envVar === undefined) {
        envVar = process.env[ 'PG' + key.toUpperCase() ];
    } else if (envVar === false) {
        // do nothing ... use false
    } else {
        envVar = process.env[ envVar ];
    }

    return config[key] ||
        envVar ||
        defaults[key];
};

var PGConnectionParse=function (config){
    config = typeof config == 'string' ? pg_string_parse(config) : (config || {});
    var ret={
        "host":val('host', config),
        "port":parseInt(val('port', config), 10),
        "database":val('database', config)
    };
    return ret;
}

exports.realAsync=realAsync;
exports.PGConnectionParse=PGConnectionParse;