## Console模块


### console的同步/异步问题
console既不是总是同步的，也不总是异步的，取决于链接的是什么流和操作系统
操作系统
- 文件系统（Files）：Windows和POSIX都是同步
- 终端（TTYs）：Windows是同步，POSIX是异步
- 管道（Pipes）：Windows是同步，POSIX是异步


### 为什么console.log（）执行完就退出

