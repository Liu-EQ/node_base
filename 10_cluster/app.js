const cluster = require('cluster')
const http = require('http')
const numCPUS = Math.min(require('os').cpus().length, 4)

if (cluster.isMaster) {
    console.log(`Master 进程 ${process.pid} 正在运行`);

    // 衍生工作进程
    for (let index = 0; index < numCPUS; index++) {
        cluster.fork()
    }


    cluster.on('exit', (worker, code, signal) => {
        console.log(`Work ${worker.process.pid} 已退出`);
    })
} else {
    http.createServer((req, res) => {
        res.end(`你好世界 ${process.pid}`)
    }).listen(8000)
    console.log(`Worker 进程${process.pid} 已启动`);
}