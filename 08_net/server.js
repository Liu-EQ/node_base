const net = require('net')
const Transcoder = require('./coder.js')
const transcoder = new Transcoder()
const HOST = '127.0.0.1'
const PORT = 3001

let overageBuffer = null; // 上次剩余Buffer数据

// 创建TCP服务器实例
const server = net.createServer()

// 开启监听，触发listening事件
server.listen(PORT, HOST)

// 监听服务成功启动
server.on('listening', () => {
    console.log(`服务已开启在 ${HOST}:${PORT}`);
})

// 监听客户端连接
// 有客户端连接时，connection事件会被触发，该事件的回调函数会接受一个socket对象，代码与特定客户端的连接
server.on('connection', (socket) => {
    // data事件是与socket对象相关的事件，属于单个连接相关的事件
    socket.on('data', (buffer) => {
        if (overageBuffer) {
            buffer = Buffer.concat([overageBuffer, buffer])
        }
        let packageLength = 0;
        while (packageLength = transcoder.getPackageLength(buffer)) {
            const package = buffer.slice(0, packageLength); // 取出整个数据包 
            buffer = buffer.slice(packageLength); // 删除已经取出的数据包，将缓冲区已取出的包直接截取
            const result = transcoder.decode(package); // 解码
            socket.write(transcoder.encode(result.body, result.serialNumber))
        }
        overageBuffer = buffer
        // const msg = buffer.toString();
        // console.log('client connection:' + msg);
        // // write方法写入TCP套接字，直接通过底层的TCP流传递数据，不需要手动触发send
        // socket.write(Buffer.from('你好 ' + msg))
    }).on('end', function () {
        console.log('socket end');
    }).on('error', function (error) {
        console.log('socket error: ', error);
    })
})

server.on('close', () => {
    console.log('Server closed');
})

server.on('error', (error) => {
    // 地址被占用
    if (error.code === 'EADDRIUSE') {
        console.log('地址正被使用，重试中。。。。。。');
        setTimeout(() => {
            server.close()
            server.listen(PORT, HOST)
        }, 1000)
    } else {
        console.error('服务异常', error);

    }
})