const koa_router = require("koa-router");
const csv = require('csvtojson');
const { param2Obj,writeFile,isFileExisted,readDir,readFile } = require('./api/utils');
const {stocks} = require('./stocks');
 



const tokens = {
    admin: {
      token: 'admin-token'
    },
    editor: {
      token: 'editor-token'
    }
  }
  
  const users = {
    'admin-token': {
      roles: ['admin'],
      introduction: 'I am a super administrator',
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      name: 'Super Admin'
    },
    'editor-token': {
      roles: ['editor'],
      introduction: 'I am an editor',
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      name: 'Normal Editor'
    }
  }

var g_router = koa_router();


g_router.get('/index', async(ctx, next) => {
    console.log('接收到get请求')
    await ctx.render("index",{
        title:"nodeWeb 首页"
    })
});

g_router.get('/', async(ctx, next) => {
    ctx.response.redirect('/index'); 
});


g_router.get("/api/path",async (ctx) => {
    let body = {};

    let data = await readFile('./config.txt');
    if (data) {
        data = data.toString();
    } else {
        throw new Error(data);
    }
    body['path'] = data;
    body['code'] = 20000;
    ctx.body = body;
    
});

g_router.get("/api/stocklist",async (ctx) => {
    let body = {};
    // let querystring = param2Obj(ctx.request.url).querystr;
    let twopaths = await getTwoPaths();

    let dirres = await readDir(twopaths.pathtick);
    let newDirRes = dirres
    .filter(item=>{
        let reg = /^[a-z]{2}[0-9]{6}$/i;
        //let reg = new RegExp(/^[a-z]{2}[0-9]{6}$/, 'i')
        let pass = true;
        // if (querystring === '' || querystring === null) {
        //     pass = true;
        // }else{
        //     pass = item.indexOf(querystring.toUpperCase()) >= 0
        // }
        return reg.test(item) && pass
    })
    .sort((a, b) => {
        if (b.indexOf('SZ')>-1) {
            return 1
        }else {
            return -1
        }
    })
    .map(item=>{
        return item+ ' ' +(stocks[item]?stocks[item]:'(未知)')
    });
    // let newArr10 = newDirRes.slice(0,10)
    // body['stocks'] = newDirRes;
    // ctx.body = body;
    // let newArr10 = newDirRes.slice(0,10)
    body['stocks'] = newDirRes;
    body['code'] = 20000;
    ctx.body = body;
    
});


async function getTwoPaths(){
    let pathstr = (await readFile('./config.txt')).toString();
    let pathArr = pathstr.split(`'`)[1].split(';');
    let pathtick = pathArr[0].split(`=`)[1];
    let pathtrd = pathArr[1].split(`=`)[1];
    return {
        pathtick,
        pathtrd
    }
}

g_router.get("/api/editPath",async (ctx) => {
    const {tickpath, trdpath} = param2Obj(ctx.request.url);
    let trdpathstr = ';path_trd='+trdpath;
    let tickpathstr = 'path_tick='+tickpath;
    let pathValue = tickpathstr+trdpathstr;
    let writeRes =await writeFile('./config.txt',pathValue);
    let newPath = '';
    if (writeRes) {
        newPath = (await readFile('./config.txt')).toString();
    }
    var body = {};
    body['newPath'] = newPath;
    body['code'] = 20000;
    ctx.body = body;
});

g_router.post("/api/tick/stat",async (ctx) => {
    const params = ctx.request.body
    const { date, stock } = params
    let body = {}
    let twopaths = await getTwoPaths();
    let dateUrl = `${twopaths.pathtick}${stock}/${date}.csv`;
    
    
    try {
        const isExist = await isFileExisted(dateUrl);
        if(isExist){
            const csvdata = await csv().fromFile(dateUrl);
            body['csvdata'] = csvdata;
            body['code'] = 20000;       
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error('tick File does not exists1');
            body['tick_file_not_exist'] = true;
            body['tick_msg'] = 'tick文件不存在';
            body['tick_path'] = err.path;
            body['code'] = 20000;
        } else {
            throw err;
        }
    }
   
    ctx.body = body;
    
});
g_router.post("/api/tick/signalAnaly",async (ctx) => {
    const params = ctx.request.body
    const { date, stock } = params
    let body = {}
    let twopaths = await getTwoPaths();
    let dateUrl = `${twopaths.pathtick}${stock}/${date}-signal-analy.csv`;
    
    
    try {
        const isExist = await isFileExisted(dateUrl);
        if(isExist){
            const csvdata = await csv().fromFile(dateUrl);
            body['csvdata'] = csvdata;
            body['code'] = 20000;       
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error('tick File does not exists1');
            body['tick_file_not_exist'] = true;
            body['tick_msg'] = 'signal-analy文件不存在';
            body['tick_path'] = err.path;
            body['code'] = 20000;
        } else {
            throw err;
        }
    }
   
    ctx.body = body;
    
});

g_router.post("/api/tick/datePnl",async (ctx) => {
    const params = ctx.request.body
    const { date, stock } = params
    let body = {}
    let twopaths = await getTwoPaths();
    let dateUrl = `${twopaths.pathtick}${stock}/${stock}_trade_pnl.csv`;
    
    
    try {
        const isExist = await isFileExisted(dateUrl);
        if(isExist){
            const csvdata = await csv().fromFile(dateUrl);
            body['csvdata'] = csvdata;
            body['code'] = 20000;       
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error('tick File does not exists1');
            body['tick_file_not_exist'] = true;
            body['tick_msg'] = 'signal-analy文件不存在';
            body['tick_path'] = err.path;
            body['code'] = 20000;
        } else {
            throw err;
        }
    }
   
    ctx.body = body;
    
});

g_router.post("/api/tick/stockPnl",async (ctx) => {
    const params = ctx.request.body
    const { date, stock } = params
    let body = {}
    let twopaths = await getTwoPaths();
    let dateUrl = `${twopaths.pathtick}DATEPNL/${date}_code_pnl.csv`;
    
    
    try {
        const isExist = await isFileExisted(dateUrl);
        if(isExist){
            const csvdata = await csv().fromFile(dateUrl);
            body['csvdata'] = csvdata;
            body['code'] = 20000;       
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error('tick File does not exists1');
            body['tick_file_not_exist'] = true;
            body['tick_msg'] = 'signal-analy文件不存在';
            body['tick_path'] = err.path;
            body['code'] = 20000;
        } else {
            throw err;
        }
    }
   
    ctx.body = body;
    
});

g_router.post("/api/user/login", async (ctx) => {
    // const param = 
    const { username } = ctx.request.body
    
    const token = tokens[username]
    if (!token) {
        return {
          code: 60204,
          message: 'Account and password are incorrect.'
        }
    }
    let postData = {code: 20000, data: token};
    ctx.response.body = postData;
})

g_router.post("/api/user/logout", async (ctx) => {
    ctx.response.body = {
        code: 20000,
        data: 'success'
    }
})

g_router.get("/api/user/info", async (ctx) => {
    const {token} = ctx.request.query
    const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }
    ctx.response.body = {
        code: 20000,
        data: info
    }
})


module.exports = {
    g_router,
}
