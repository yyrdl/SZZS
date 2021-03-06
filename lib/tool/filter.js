var config = {};
exports.config = function (conf) {
	config = conf;
};
exports.filter = function (info) {
	if (config[info.type] !== undefined) {
		var result = {
			"type" : info.type,
			"time_cost" : info.time_cost,
            "host_ip":info.host_ip
		};
		(info.dest !== undefined) && (result.dest = info.dest);
		(config.project_name !== undefined) && (result.project_name = config.project_name);
		result.is_error = (info.is_error !== undefined ? info.is_error : false);
		for (var p in config[info.type]) {
			result[p] = config[info.type][p].value !== null ? config[info.type][p].value : info[p];
		}
		return result;
	} else {
		return null;
	}
}
