## Net模块

### OSI网络模型 和 TCP/IP模型

### TCP协议
- 面向链接（有三次握手和四次挥手）
- 面向字节流
- 可靠


### TCP服务器常用API
```
// 创建TCP服务器实例
const server = net.createServer() // 内部还是调用net.server
const server = new net.server() // Server类内部集成了EventEmitter

/**
 * 启动监听
 * @param {Number} port 监听的端口号
 * @param {String} host 可选，监听的主机，默认0.0.0.0 表示所有可用的网络接口
 * @param {Number} backlog 可选 指定在拒绝连接前，操作系统可以保持的最大连接数
 * @param {Function} callback 可选 服务器开始监听时调用的回调函数
 */
server.listen(port[, host][, backlog][, callback])


// 关闭服务
server.close([callback])

// 获取地址信息
server.address()

/**
 * 获取连接到服务器的客户端数量
 * @param {Function} callback 回调函数，接收两个参数：错误对象和连接数量
 */
server.getConnections(callback)

// 使服务器保持活跃状态，保证服务器在没有连接时仍然保持活动状态，适合需要持续运行的服务
server.ref()

// 允许NodeJS在服务器没有活动连接时退出，保证服务器在没有连接时退出，适合临时或者不需要持续运行的服务
server.unref()
```



### Net模块构建TCP协议
```
new net.Server()
net.createServer()
```
- net.createServer 内部还是调用了net.Server对象进行实现
- net.Server对象内部继承了EventEmitter类

- TCP服务事件
    - TCP服务器事件（TCP服务层面的事件————关注整个服务器的全局状态）
        - listening：即server.listen（），服务器成功绑定端口，开始监听时触发，表示服务器已经准备就绪，可以接收新的连接请求
        - connection：当有新的TCP连接建立时，服务器对象会触发该事件，会传递一个表示新连接的net.Socket对象，服务器可以统一对每一个新连接进行处理（分发、记录日志等）
        - close：服务器关闭，不再接受新连接时触发，通常在调用server.close() 后触发
        - error：服务器在监听或者连接过程中遇到错误时触发，有助于捕获端口被占用、权限不足等问题
    - TCP链接事件方法（单个连接层面的事件————关注单个链接本身）
        - data：当前连接接收到数据时触发，socket会以Buffer形式发出此事件，应用程序可以在监听中处理接收到的数据
        - end：远端结束发送数据（发送Fin包），表示数据传输完成，此时socket处于半关闭状态，还可以写入数据
        - close：完全关闭时触发，此时数据传输结束，socket资源被释放
        - error：连接过程中发生错误（网络中断、连接被重置）
        - timeout：超时事件
- 对于clien和server的connect（connection）事件
    - client的connect事件是在客户端和服务器成功连接之后被触发，用于确保连接状态，相应回调中可以进行对应的数据传输
    - server的connection事件也是在客户端和服务器成功连接之后被触发，主要用于通信，会接收到代表该链接的socket对象作为回调参数，具体的数据传输需要在socket对象的生命周期上进行处理

### TCP粘包问题
- 产生原因
    创建TCP服务器之后（net.createServer），处理底层的TCP流，没有内建的消息边界，
    数据通过连续调用write方法写入到TCP套接字，
    底层TCP协议会根据网络状况、缓冲区状态和拥塞机制对数据进行分段和合并，不会保留应用层消息的边界
    所以即使调用write方法时发送的数据在应用层看起来是一个‘消息’，在TCP层面可能被拆分、合并
- 解决方式（数据发送方处理）
    - cork()/uncork() 机制
        ```
        socket.cork()
        socket.write('data block 1')
        socket.write('data block 2')
        socket.uncork()
        // 上述方式会将cork/uncork之间的数据进行缓存，在调用uncork时才会统一发送数据
        ```
    - 应用层消息定界（封包/拆包）
        在应用层设计一个消息格式，比如每个消息加上固定长度的头部，指明后续消息的长度或者使用特定分隔符，以确保接收端可以正确拆分接收到的数据流
    - 延迟发送————使用sleep，来增加两次消息发送之间的间隔
    - 关闭Nagle算法
    >Nagle算法是改善网络传输效率的算法，避免网络中充斥着大量小的数据块，会将小的数据块进行合并，集合起来一起发送，减少网络拥堵

