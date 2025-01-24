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
 * 进程事件：process.on('uncaughtError', cb) process.on('exit', cb)
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
