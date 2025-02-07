// 进程
/** 
 * 计算机中的程序关于某数据结合上的一次运行活动，
 * 是系统进行资源分配的和调度的基本单位，
 * 是操作系统结构的基础
 * 是线程的容器
 * */

/**
 * NodeJS通过node app.js开启一个服务进程
 * 多进程就是进程的复制（fork），fork出来的每个进程都拥有自己独立的空间地址、数据栈，
 * 一个进程无法访问另一个进程中定义的变量、数据结构，只有建立了IPC通信，进程之间才可以共享数据
 */



// 线程
/**
 * 线程是操作系统进行运算调度的最小单位，线程隶属于进程
 * 同一进程中的线程可以共享进程中的全部系统资源，如虚拟地址空间、文件描述符和信号处理等
 * 同一进程中的各个线程有自己独立的调用栈、自己的寄存器环境、自己的线程本地存储
 */

// NodeJS虽然是单线程模型，但是基于事件驱动、异步非阻塞模式，可以应用于高并发场景，避免了线程创建，线程之间上下文切换产生的资源开销
// NodeJS在多核CPU可以使用chld_process.fork或者Cluster来实现多进程架构，开启多进程不是为了解决高并发，主要是解决了单进程模式NodeJS对CPU利用率不足的情况


// Process
// 全局对象，无需require直接使用，提供当前进程的相关信息
/**
 * process.env
 * process.nextTick
 * process.pid
 * process.ppid
 * process.cwd()
 * process.platform
 * process.uptime
 * 进程事件：process.on('uncaughtException', cb)    process.on('exit', cb)
 * 标准流：process.stdout   process.stdin   process.stderr
 */
/**
 * 基于NodeJS的进程
 *  JS是单线程，但是作为宿主环境的NodeJS并不是单线程
 *  JS的单线程缘故，一些消耗CPU资源的任务不要交给NodeJS来处理，当你的业务需要大量计算、视频编码解码等CPU密集型任务时，可以使用C
 *  Node和Nginx均采用事件驱动，避免多线程的线程创建、线程上下文切换的开销，如果业务大多是基于I/O操作，可以选择使用NodeJS进行开发
 */




// NodeJS进程创建
/**
 * child_process.spawn —— 适用于返回大量数据，例如图像处理，二进制数据处理
 * child_process.exec —— 适用于小量数据，maxBuffer默认值为200 * 1024 超出这个默认值会导致程序崩溃
 * child_process.execFile —— 类似child_process.exec，但是不会创建shell，不能通过shell执行，不支持I/O重定向和文件查找这样的行为
 * child_process.fork —— 衍生新的进程，进程之间相互独立，每个进程都有自己的V8实例，内存、系统资源是有限的，不建议衍生太多子进程，通常根据系统CPU核心数设置
 */

// child_process.spawn(command[,args][, options])
// 创建父子进程通信的三种方式   
// 让子进程的stdio和父进程的stdio建立管道连接 child.stdout.pipe(process.stdout)
// 父子进程之间公用stdio
// 事件监听
const { spawn } = require('child_process')
const child = spawn('ls', ['-l'], { cwd: '/' })

child.stdout.pipe(process.stdout)
console.log(process.pid, child.pid);


// child_process.exec
const { exec } = require('child_process')

exec('node -v', (error, stdout, stderr) => {
    console.log({ error, stdout, stderr });
})

// child_process.execFile
const { execFile } = require('child_process')
execFile('node', ['-v'], (error, stdout, stderr) => {
    console.log({ error, stdout, stderr });
})

// child_process.fork
const { fork } = require('child_process');
const { sign } = require('crypto');
fork('./06_thread&process\child.js', ['child'], { cwd: '/' })


// 利用fork充分利用CPU资源
const http = require('http')

const server = http.createServer((req, res) => {
    if (req.url === '/computed') {
        const computed = fork('./fork_computed.js')
        computed.send('开启一个新的子进程')

        // 监听子进程 当子进程使用process.send时会触发 message 事件
        computed.on('message', sum => {
            res.end(`Sum is ${sum}`)
            computed.kill()
        })

        computed.on('close', (code, signal) => {
            console.log(`收到子进程close事件，子进程收到信号${signal}而终止，退出码${code}`);
            computed.kill()
        })
    } else {
        res.end('ok')
    }
})

server.listen(3000, '127.0.0.1', () => {
    console.log('server started at http://127.0.0.1:${3000}');
})





// NodeJs的多进程架构
// 多进程架构优势：解决单进程、单线程无法充分利用CPU资源的问题
// 多进程架构下一般会有一个主进程和多个工作进程
// 主进程
const cpus = require('os').cpus()

const netServer = require('net').createServer()
// net模块是传输层层面针对TCP协议，http模块是应用层面针对HTTP协议
/**
 * net模块
 *  是传输层，创建TCP服务器，处理传输层的原始字节流数据
 *  基于socket，是面向连接的，可靠的传输层协议
 *  适合自定义协议或者需要直接操作底层数据的场景（聊天服务器、游戏服务器）
 *  需要自己处理底层数据，解析客户端发送的原始数据(Buffer)，可能需要处理粘包、拆包问题
 * http模块
 *  是应用层，创建HTTP服务器，内部已经封装了请求的解析，自动将请求内容解析成req对象，包括请求头，正文等，开发者可以直接使用，而无需关注底层细节
 *  使用web服务器，RESTful API服务器等需要HTTP协议支持的情况
 *  
 * net.server 返回的是net.Socket对象  http.server处理连接时会生成http.incomingMessage 和 http.ServerResponse对象
 */

netServer.listen(3000);
process.title = 'Node Master'

const workers = {}
const createWorker = () => {
    const work = fork('./work.js')
    work.on('message', function (message) {
        if (message.sct = 'suicide') {
            createWorker()
        }
    })

    work.on('exit', function (code, signal) {
        console.log('work process exited, code: %s signal:%s', code, signal);
        delete workers[work.pid]
    })

    work.send('server', netServer)
    workers[work.pid] = work
    console.log('work process created, pid: %s ppid: %s', work.pid, process.pid);
}

for (let i = 0; i < cpus.length; i++) {
    createWorker();
}

process.once('SIGINT', close.bind(this, 'SIGINT')); // kill(2) Ctrl-C
process.once('SIGQUIT', close.bind(this, 'SIGQUIT')); // kill(3) Ctrl-\
process.once('SIGTERM', close.bind(this, 'SIGTERM')); // kill(15) default
process.once('exit', close.bind(this));

function close(code) {
    console.log('进程退出！', code);

    if (code !== 0) {
        for (let pid in workers) {
            console.log('master process exited, kill worker pid: ', pid);
            workers[pid].kill('SIGINT');
        }
    }

    process.exit(0);
}



// 守护进程——————运行在后台，不受终端影响
/**
 * 创建步骤：
 *  创建子进程
 *  在子进程中创建新会话
 *  改编子进程工作目录
 *  父进程终止
 */
function startDaemon() {
    const daemon = spawn('node', ['daemon.js'], {
        cwd: '/usr',
        detached: true,
        stdio: 'ignore'
    })
    console.log('守护进程开启， 父进程pid：%s， 守护进程 pid：%s', process.pid, daemon.pid);
    daemon.unref()
}
