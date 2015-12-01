var os = require("os");
function getLocalIPV4Adress() {
	var interfaces = os.networkInterfaces();
    var local_ip=null;
	for (var devName in interfaces) {
		var iface = interfaces[devName];
		for (var i = 0; i < iface.length; i++) {
			var alias = iface[i];
			if (alias.family === 'IPv4' && alias.address !== '127.0.0.1') {
                if(local_ip===null){
                   local_ip=alias.address;
                }
                if(!alias.internal) {
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
