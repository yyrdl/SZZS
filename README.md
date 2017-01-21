## intro
    szzs is node.js performance probe, it can gather information of some frequently-used node.js lib ,such as mysql,postgress,redis,and http module. Not for all common-use libs,and I am __not going to maintaining__ this project. But it shows a nice way to collect information at runtime.The core code is in directory main and spy,and main idea is hooking target module when it is loading by the module system.
  
## how to use
 npm install szzs
  
adding code like below at the most beginnig of your project ,and config szzs
```javascript
   // config what module you want to monitor
   var config={
    "project_name":"szzs test",//set your project name,optional 
    "http_server":{// the module you want to monitor
       "host_ip":{"value":null}//what field you want, if the value of key "key" is not null ,it will be the de default value
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
 
/*
  // config like this means "I" just want to monitor pg(postgress)
  var config={
    "pg":{}
  };
  }
*/
// the code before your project 
var szzs=require("szzs");
szzs.config(config).on("message",function(msg){
   //handle the informations collected by szzs
   console.log(msg);
});
```
default fields:

* type //means which  module
* is_error //boolean ,is error occurred
* error  //the error ,may be undefined
* dest //the target end point ,maybe your mysql database address
* time_cost //time cost (ms)
* host_ip //local machine ip(IPV4)


result example：
 
```javascript
 { type: 'redis',
  time_cost: 84,
  is_error: false,
  dest: '**.**.***.**:****',
  project_name: 'szzs test',
  host_ip: '***.***.***.***' }
  
  { type: 'http_server',
    time_cost: 566,
    host_ip: '***.***.***.***',
    dest: 'http://***.***.***.***:8080/get_view',
    is_error: false }
  
  { type: 'pg',
  time_cost: 144,
  is_error: false,
  dest: '***.***.***.59:5432/test',
  project_name: 'szzs test',
  host_ip: '***.***.***.***' }
```

 
## more

##### 1 all support modules whole information

* http module：
```javascript
      //http_client
      {
            "type":"http_client",
            "host_ip":"",//本机Ip
            "host_name":"",//本机名
            "server_ip":"",//请求目的主机的Ip target server ip
            "server_port":"",//请求主机上对应服务监听的端口 target server port
            "path":"",
            "headers":"",
            "method":"",
            "time_cost":"",
            "is_error":"",
            "error":"",
            "dest":""
      }
       dest="http://"+server_ip+":"+server_port+path
      //http_server
      {
            "type":"http_server",
            "host_ip":"",//本机Ip
            "host_name":"",//本机名
            "host_port":"",
            "client_ip":"",//对方主机Ip 
            "time_cost":"",
            "dest":"",
            "req_method":"",
            "res_statuscode":"",
            "is_error":"",
            "error":""
      }
      dest="http://"+host_ip+":"+host_port+req.url
```

* mysql module
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

* redis module
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

* pg module
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
 
##### 3. self-defined probes

###### 3.1 Promise 
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
 
 information collected by szzs 
```javascript
 {{ type: 'test Promise',
  is_error: false,
  error: '',
  time_cost: 1195,
  project_name: 'szzs test',
  parameter: [ 1 ],
  output: 10 }
```
###### 3.2 not promise
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
