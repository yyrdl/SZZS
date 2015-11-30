/**
 * Created by Administrator on 2015/8/27.
 */


var os=require("os");
function getLocalIPV4Adress(){
    var interfaces = os.networkInterfaces();
    for(var devName in interfaces){
        var iface = interfaces[devName];
        for(var i=0;i<iface.length;i++){
            var alias = iface[i];
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                return alias.address;
            }
        }
    }
}
function getHostName(){
    return os.hostname();
}

exports.getLocalIPV4Adress=getLocalIPV4Adress;
exports.getHostName=getHostName;