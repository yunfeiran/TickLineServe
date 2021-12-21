const Koa = require("koa");
const koa_bodyparser = require("koa-bodyparser");
const koastatic = require('koa-static');
const cors = require('koa2-cors');
const path = require('path');

const router = require("./router.js");

const SVR_HOST = "0.0.0.0";
const SVR_PORT = 1995;

let g_webServer = null;

function main()
{
    var app = new Koa();

    app.use(
        cors({
            origin: function(ctx) { //设置允许来自指定域名请求
                //if (ctx.url === '/test') {
                    return '*'; // 允许来自所有域名请求
                // }
                // return 'http://localhost:8080'; //只允许http://localhost:8080这个域名的请求
            },
            // maxAge: 5, //指定本次预检请求的有效期，单位为秒。
            credentials: true, //是否允许发送Cookie
            allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
            allowHeaders: ['Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild'], //设置服务器支持的所有头信息字段
            exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
        })
    );

    app.use(koa_bodyparser({
        enableTypes:["json","test","form"],
        onerror:function (err,ctx){
            console.log("webserver body parse error",err);
            ctx.throw(400,"body parse error");
        },
    }));

    // 设置主目录
    const staticPath = '/public/dist';
    app.use(koastatic(path.join( __dirname, staticPath)));
    app.use(koastatic(__dirname + '/static/dist',{
        extension: 'html'
    }))

    app.use(router.g_router.routes());

    g_webServer = app.listen({
        host:SVR_HOST,
        port:SVR_PORT,
    });

    console.log('webserver start listen on: ', SVR_PORT);

    app.on('error', err => {
        log.error('webserver error', err);
    });
}

main();
