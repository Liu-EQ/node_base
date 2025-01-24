// Buffer
// Buffer(缓冲)、Cache(缓存)
// Buffer用于在TCP流、文件操作系统，以及其他上下文中与八位字节流进行交互
// NodeJS可以通过Buffer来处理二进制流数据或者与之进行交互
// 用于读取或者操作二进制数据流，用于操作网络协议、数据库、图片和文件I/O等一些需要大量二进制数据的场景
// Buffer在创建时大小就已经确定，而且无法调整，在内存分配上是由C++层面提供的，而不是V8



// 二进制数据
// 使用0 和 1两个数码来表示数据


// Stream
// 对输入、输出设备的抽象，這里的设备可以是文件、网络、内存等
// 流是具有方向性的


// Buffer
// 缓冲区处理，数据到达速度 》 进程处理速度 需要在Buffer中等待，一方面是为了保证逻辑完整性，一方面是为了保证效率；数据到达速度 《 进程处理速度 ，需要在Buffer中等待

// 基本使用
// 创建
// Buffer.from —— 基础创建方式
// Buffer.from(data[,encoding])
// 适用 根据现有数据创建Buffer 如字符串、数组
const buffer1 = Buffer.from('10')
const buffer2 = Buffer.from('10', 'utf8')
const buffer3 = Buffer.from([10])
const buffer4 = Buffer.from(buffer3)

console.log('buffer.from', buffer1, buffer2, buffer3, buffer4);


// Buffer.alloc —— 返回一个已经初始化的Buffer，可以保证新创建的Buffer
// Buffer.alloc(size[, fill[, endoing]])
// 适用于分配指定大小，且安全性要求较高的场景
const bAlloc1 = Buffer.alloc(10)

// Buffer.allocUnsafe —— 返回一个指定大小的内存，创建一个Buffer，不清零，新创建的Buffer中可能包含旧数据
//  Buffer.allocUnsafe(size)
// 适合高性能，但是对安全性要求不高的场景
const bAlloc2 = Buffer.allocUnsafe(10)


// 字符串转Buffer
const buf = Buffer.from('NodeJS Buffer test', 'utf-8')
console.log(buf);
console.log('string', buf, buf.length, buf.toString('utf-8', 0, 11));




// 图片转Base64
const fs = require('fs')
const path = require('path')


function imageToBase64(filePath) {
    try {
        const file = fs.readFileSync(filePath)

        const imgBase64 = Buffer.from(file).toString('base64')
        return imgBase64

    } catch (error) {
        console.log('error', error);
    }
}

const imgPath = path.join(__dirname, './img_1.jpg')
const base64 = imageToBase64(imgPath)
console.log('base64', base64);


// Buffer内存机制
// Buffer处理二进制数据，如果使用一点就向系统申请，会造成频繁的系统申请，所以Buffer占用的内存不再由V8分配，而是在NodeJS的C++层面完成申请，在JS中进行内存分配，也就是C++申请内存，JS分配内存，这部分内存我们称为堆外内存
// NodeJS采用slab机制进行预先申请，事后分配，是一种动态管理机制
// slab有如下三种状态：full——完全分配状态；partial——部分分配状态；empty——没有被分配状态
// 8KB：NodeJS以8KB为界限来区分是小对象还是大对象
// 基于上述8KB的特性，所以在一个Buffer对象被创建时，就已经通过poolSize来确定了大小，且无法改变，在创建时，还会创一个变量poolOffset来确定当前已经使用了多少的空间

// 内存分配总结
// 初次加载（第一次调用Buffer或者调用依赖于Buffer的方法时）：系统会分配一个初始的共享内存池（slab空间）
// 后续根据调用Buffer方法时申请的空间大小，区分为小Buffer对象和大Buffer对象，
// 小Buffer对象，会去判断当前的slab空间是否还有足够空间，
    // 如果空间足够，则直接使用剩余空间更新slab状态，poolOffset也会增肌
    // 如果空间不足，则会创建一个新的slab空间进行分配
        // 针对空间不足，会直接创建一个新的slab空间进行分配，不会出现一个Buffer对象跨越两个slab空间的情况
        /**
         * 原因：
         *  性能考虑（内存连续有助于提高访问速度，避免了额外的指针管理和复杂的内存寻址逻辑）
         *  简化设计 一个Buffer始终对应一块连续的内存，便于底层操作，跨域多个slab空间的Buffer对象会增加额外的管理成本，需要维护更多的元数据，维护了slab设计的初衷
         *  垃圾回收方便    一个slab空间的所有内存分配都是由V8的垃圾回收机制管理，如果跨越多个slab空间，会导致复杂的内存追踪问题，影响GC效率
         */
    // 小Buffer对象还会使用fastBuffer对象进行优化，fastBuffer是一个内部优化的类，用于快速创建和操作Buffer对象，避免了不必要的初始化开销，目的就是为了提高小型或者频繁的分配Buffer的性能，减少内存分配的开销       
// 大Buffer对象，会直接走createUnsafeBuffer(size)函数，由C++直接分配内存




// Buffer应用场景
// I/O操作
    // Stream中不需要我们手动创建自己的缓冲区，NodeJS的Stream中会自动创建
// zlib.js（压缩、解压缩）
// 加解密




// Buffer  VS Cache
// Buffer用于处理二进制数据流，将数据进行缓冲，是临时性的，对于流式数据，会采用缓冲区将数据临时存储起来，等缓冲到一定大小之后存在硬盘中
// cache 是一个中间层，可以永久的将热点数据进行缓存，使得访问速度更快

// cache是为了弥补高速设备和低速设备的鸿沟而引入的中间层，最终起到“加快访问速度”的作用。cache是系统两端处理速度不匹配时的一种折中策略
// Buffer是为了进行流量整形，把突发的大数量较小规模的I/O整理成平稳的小数量较大规模的I/O，以“减少相应次数”。Buffer是系统两端处理速度平衡时使用的


// Buffer VS String
// 前后端数据传输，如果使用二进制数据进行传输，该如何操作，相比于传统的JSON格式，又有什么优势

