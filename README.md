##简介
    node.js 应用性能监测器的探针，最终支持分布式系统。
    取名为SZZS是为了纪念2015年6月至8月的A股（上证指数）
    目前支持监测http协议的收发，数据库支持mysql ,postgress, redis.
    因为个人项目需要只写了这几个，其他的模块在后续不忙的时候添加
   
非常感谢my great master [dingziran](https://github.com/dingziran)和鸣哥提出的建议。
## 详细文档
##### 1 目前所监听模块的全量信息

* http的全量信息：
```javascript
      //http_client
      {
            "type":"http_client",
            "host_ip":"",//本机Ip
            "host_name":"",//本机名
            "server_ip":"",//请求目的主机的Ip
            "server_port":"",//请求主机上对应服务监听的端口
            "path":"",
            "headers":"",
            "method":"",
            "time_cost":"",
            "is_error":"",
            "error":"",
            "dest":""
      }
      //http_server
      {
            "type":"http_server",
            "host_ip":"",//本机Ip
            "host_name":"",//本机名
            "port":"",
            "client_ip":"",//对方主机Ip
            "time_cost":"",
            "dest":"",
            "req_method":"",
            "res_statuscode":"",
            "is_error":"",
            "error":""
      }
```

* mysql全量信息
```javascript
     {
            "type":"mysql",
            "host_ip":"",//本机ip
            "host_name":"",//本机名
            "server_ip":"",//mysql所在服务器的IP
            "server_port":"",//mysql工作的端口
            "database":"",//数据库名
            "time_cost":"",//耗时
            "sql":"",//本次请求的sql语句
            "parameter":"",//本次请求发送的参数
            "is_error":false,//是否出错
            "error":"",//error.message
            "dest":""//应当时拓扑图要求加的参数
     }
     dest=server_ip+":"+"/"+server_port+"/"+database
```

* redis 全量信息
```javascript
   {
                "type":"redis",
                "host_ip":"",//本机ip
                "host_name":"",//本机名
                "server_ip":"",//redis所在主机的IP
                "server_port":"",//redis的工作端口
                "command":"",//本条操作所使用的redis指令名
                "parameter":"",//参数
                "is_error":false,
                "error":"",
                "time_cost":0,
                "dest":""
   }
   dest=server_ip+":"+server_port
```

* pg 全量信息
```javascript
   {
             "type":"pg",
             "host_ip":"",//本机ip
             "host_name":"",//本机名
             "server_ip":"",//redis所在主机的IP
             "server_port":"",//redis的工作端口
             "database":"",//目标数据库名
             "sql":"",
             "parameter":"",
             "is_error":"",
             "error":"",
             "time_cost":"",
             "dest":""
   }
   dest=server_ip+":"+"/"+server_port+"/"+database
```
 
##### 2. 使用示例
  npm install szzs
  
在项目的最开始加如下代码:
```javascript
   var config={
    "project_name":"szzs test",//设置项目名
    "http_server":{//设置要监听的type
       "host_ip":{"value":null}//在type为http_server的监测信息中提取host_ip字段
       //其余的除默认字段外全部会被忽略,若value的值不为null，则监测信息的该字段的
       //值始终为您再这里设置的值。比如您设成了127.0.0.1，szzs采集到一条http_server信息里的
       //host_ip的值是110.110.110.110，那么该字段的值会被替换成127.0.0.1
    },
    "redis":{
        "host_ip":{"value":null}
     },
     "pg":{
        "host_ip":{"value":null}
     },
     "mysql":{
        "server_ip":{"value":null}
     }
};
//只有在这里配置了的模块才会被监听

var szzs=require("szzs");
szzs.config(config).on("message",function(msg){
   //这里探针会传来监测到的信息，你可以在这里写你自己的监测信息处理逻辑
   console.log(msg);
});
```
默认会有的字段:
* type
* project_name
* is_error
  布尔类型
* error  
  值可能是undefined
* dest
* time_cost


 监测到的结果示例：
```javascript
 { type: 'redis',
  time_cost: 84,
  is_error: false,
  dest: '**.**.***.**:****',
  project_name: 'szzs test',
  host_ip: '***.***.***.***' }
  
  { type: 'http_server',
  time_cost: 41,
  is_error: false,
  dest: '/public/html/index.html',
  project_name: 'szzs test',
  host_ip: '***.***.***.***' }
  
  { type: 'pg',
  time_cost: 144,
  is_error: false,
  dest: '***.***.***.59:5432/test',
  project_name: 'szzs test',
  host_ip: '***.***.***.***' }
```
##### 3. 自定义探针
###### 3.1 Promise类型
  若返回是一个promise ,请使用szzz.promiseProxy,使用示例如下：
```javascript
  var szzs=require("szzs"); 

   function testP(t){
      return new Promise(function(resolve,reject){
        setTimeout(function(){
          (Math.random()>0.5&&(resolve(t*10)))||(reject(new Error("Error Occured!")))
        },1000)
      });
   }
   var func=szzs.promiseProxy(testP,{
      "type":"test Promise",
      "input":true,
      "output":true
   });
   
    func(1).then(function(r){
      console.log(r);
    }).catch(function(err){
      console.error(err.stack);
    });
```
监测到的信息会发往 `szzs.config().on("message",function(msg){})`你只需在项目的开始监听一次即可，而你可以在项目中的任何一个地方使用自定义探针。收集的自定义探针信息示例
```javascript
 {{ type: 'test Promise',
  is_error: false,
  error: '',
  time_cost: 1195,
  project_name: 'szzs test',
  parameter: [ 1 ],
  output: 10 }
```
###### 3.2 非Promise类型
```javascript
var szzs=require("szzs");


function testP(t){
	throw new Error("test error");
}
var func2=szzs.generalProxy(testP,{
	"type":"self test",
	"input":true,
	"output":true
});

setTimeout(function(){
	try{
		console.log(func2(2));
	}catch(e){

	}
},2000);
```
监测的信息示例：
```javascript
  { type: 'self test',
  is_error: true,
  error: 'test error',
  time_cost: 1,
  project_name: 'szzs test',
  parameter: [ 2 ] }
```

##一个应用截图
这是当初运用这个做的公司分布式服务的监控截图，可以实时监控每一个节点，每一条路径的运行情况。支持动态添加节点。图
是用D3画的，然后使用了ElasticSearch.
![](https://github.com/yyrdl/SZZS/blob/master/img/demo.png)
