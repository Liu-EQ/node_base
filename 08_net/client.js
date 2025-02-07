const net = require('net')
const Transcoder = require('./coder.js')
const transcoder = new Transcoder()

const client = net.createConnection({
    host: '127.0.0.1',
    port: 3001
})

// 上次Buffer剩余的数据
let overageBuffer = null

// client.on('connect', () => {
// client.write('NodeJS 技术栈')

// 原始TCP发送方式
// setTimeout(() => {
//     client.write('JavsScript');
//     client.write('TypeScript');
//     client.write('Python');
//     client.write('Java');
//     client.write('C');
//     client.write('PHP');
//     client.write('ASP.NET');
// }, 1000)

// 粘包解决方案一：间隔发送
// const arr = [
//     'JavaScript ',
//     'TypeScript ',
//     'Python ',
//     'Java ',
//     'C ',
//     'PHP ',
//     'ASP.NET '
// ]

// for (let i = 0; i < arr.length; i++) {
//     (function (val, k) {
//         setTimeout(() => {
//             client.write(val);
//         }, 1000 * (k + 1))
//     }(arr[i], i));
// }

// 粘包解决方案二：关闭Nagle算法

// 粘包解决方案三：格式化数据体
// })

/**
 * 对接收到的Buffer数据的处理
 *  判断之前是否又未被处理的Buffer数据，如果有，就进行拼接，确保数据完整性，不会造成数据丢失
 *  对接收到的Buffer数据进行拆分，拆分的逻辑已经抽离到了解码过程中，通过while循环，判断剩余的Buffer数据，是否还是一个完整的数据包
 *      如果是一个完整的数据包，则拆出一个单独的Buffer数据包，将这个数据包进行解码，得到对应的数据，后续处理可以通过回调进行处理
 *          每次如果处理完一个单独的Buffer数据包，还需要从原始数据中截取掉已经处理过的数据，保证原始buffer包中最新一个始终未被处理，以确保getPackageLength可以直接从头部进行获取
 *      如果剩余的不是一个完整的数据包，则会跳出while循环，同时将剩余的数据包进行存储
 */
client.on('data', buffer => {
    if (overageBuffer) {
        buffer = Buffer.concat([overageBuffer, buffer])
    }
    let packageLength = 0;
    while (packageLength = transcoder.getPackageLength(buffer)) {
        const package = buffer.slice(0, packageLength) // 获取完整数据包
        buffer = buffer.slice(packageLength) // 删除已经取出的数据包，直接将缓冲区（buffer）中已经取出的数据截取掉
        const result = transcoder.decode(package); // 解码
        console.log(result, 'result');
    }
    overageBuffer = buffer
    console.log('client recive data', buffer.toString());
}).on('error', error => {
    console.error('服务器异常:' + error);
}).on('close', msg => {
    console.log('客户端连接被断开：' + msg);
})

// client.on('error', error => {
//     console.error('服务器异常:' + error);
// })

// client.on('close', msg => {
//     console.log('客户端连接被断开：' + msg);
// })

client.write(transcoder.encode('0 NodeJS 技术栈'))

const arr = [
    '1 JavaScript ',
    '2 TypeScript ',
    '3 Python ',
    '4 Java ',
    '5 C ',
    '6 PHP ',
    '7 ASP.NET '
]
setTimeout(() => {
    for (let index = 0; index < arr.length; index++) {
        console.log(arr[index], 'message');
        client.write(transcoder.encode(arr[index]))
    }
})
