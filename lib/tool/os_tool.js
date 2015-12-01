var os = require("os");
function isNeiWang(ip){
	var temp=ip.toString().split(".");
	temp=temp.map(function(item){
		return parseInt(item);
	});
	if(temp[0]==10){
		return true;
	}
	if(temp[0]==172&&temp[1]>15&&temp[1]<32){
		return true;
	}
	if(temp[0]==192&&temp[1]==168){
		return true;
	}
	return false;
}
function getLocalIPV4Adress() {
	var interfaces = os.networkInterfaces();
    var local_ip=null;
	for (var devName in interfaces) {
		var iface = interfaces[devName];
		for (var i = 0; i < iface.length; i++) {
			var alias = iface[i];
			if (alias.family === 'IPv4' && alias.address !== '127.0.0.1'&&!alias.internal) {
                if(local_ip===null){
                   local_ip=alias.address;
                }
                if(!isNeiWang(alias.address)) {
                    local_ip = alias.address;
                }
			}
		}
	}
    return local_ip;
}

function getHostName() {
	return os.hostname();
}
exports.getLocalIPV4Adress = getLocalIPV4Adress;
exports.getHostName = getHostName;
