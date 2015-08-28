/**
 * Created by Administrator on 2015/8/27.
 */


var os=require("os");
function getLocalIPAdress(){
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
function getClientIp(req) {
    var ip= req.headers['x-forwarded-for'] || req.connection.remoteAddress ||req.socket.remoteAddress ;
    ip=ip.split(":");
    return ip[ip.length-1];
};

exports.getLocalIPAdress=getLocalIPAdress;
exports.getClientIP=getClientIp;