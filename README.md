##简介
```
    node.js 应用性能监测器的探针，最终支持分布式系统。
    取名为SZZS是为了纪念2015年6月至8月的A股（上证指数）
    目前支持监测http协议的收发，数据库支持mysql ,postgress, redis.
    因为个人项目需要只写了这几个，其他的模块在后续不忙的时候添加

```
##使用方法
```
     先 npm install szzs

     然后在项目的最开始写：

     var MsgBox=require("szzs").MsgBox;

     MsgBox.on("message",function(msg){
       //to do:

     });

     哈哈，这样就能自动监听了

    你可以根据自己的需求去处理msg，msg里面包含了具体的请求发送信息（信息类别，如http_client，pg等,
    相应的还有ip,port的信息，不同类型包含的信息不一样），最重要的是包含了此处请求的耗时我暂时使用了
    graylog的图形界面做了简单的统计。对于分布式系统，想要看到各个服务之间的联系以及调用情况还需自己
    编写数据处理服务器，并交由前端展现。
```