const http = require('http')
const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'content-type': 'text/plan'
    });
    res.sendDate('I am work pid: ' + process.pid + ', ppid:' + process.ppid)
})


let work;
process.title = 'node-worker'
// 此处的sendHandler是父进程传递的服务器句柄，也就是fork产生的work
process.on('message', function (message, sendHandler) {
    if (message === 'server') {
        work = sendHandler;
        work.on('connection', function (socket) {
            // 手动触发 HTTP服务器的connection事件
            server.emit('connection', socket)
        })
    }
})

process.on('uncaughtException', function (error) {
    console.log(error);
    process.send({ act: 'suicide' });
    work.close(function () {
        process.exit()
    })
})