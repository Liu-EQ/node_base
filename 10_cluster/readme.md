## Cluster 模块

### Cluster 集群模式
集群模式实现通常是两种方案
>正向代理：客户端通过代理服务器想目标服务器发送请求，隐藏客户端信息，可以在代理服务器增加缓存，同时进行访问控制和内容过滤
>反向代理：客户端将请求发送给代理服务器，代理服务器将请求转发至内部目标服务器，隐藏目标服务器信息
    - 方案一：一个Node实例开启多个端口，通过反向代理服务器向各个端口进行服务转发
      - 问题：占用多个端口，造成资源浪费，多个实例独立运行，进程间通信不太好做，但是稳定性高，各实例间，无影响
    - 方案二：一个Node实例开启多个进程监听同一个端口，通过负载均衡技术分配请求（Master -> Worker）
      - 问题：多个Node进程监听同一个端口，进程间通信相对简单，减少端口资源浪费，但是需要保证服务进程稳定性，同时对于Master进程稳定性也有更高要求，编码要求也会更高

### 多个进程监听同一个端口
Master进程创建一个Socket并绑定监听到该目标端口，通过与子进程之间建立IPC通道之后，通过调用子进程的send方法，将Socket(链接句柄)传递过去

### 进程间通信
NodeJS通过pipe实现进程通信，pipe作用域有血缘关系的进程，通过fork传递，其本身也是一个进程，将一个进程的输出作为另一个进程的输入
>进程通信方式：pipe(管道)、消息队列、信号量、Domain Socket

### 对多个Worker进行请求分发(负载均衡)
NodeJS中的轮询策略：
- RoundRobin（RR）:无状态轮询策略，假定每台服务器硬件资源、处理性能基本一致，适用于同一组服务器中各服务器拥有相同软硬件配置，且服务请求响应时间较为平均
  - 设置方式
    ```
    // 直接在对应的cluster文件中设置
    cluster.schedulingPolicy = cluster.SCHED_RR // cluster对象中schedulingPolicy为2
    // 设置启动命令
    env NODE_CLUSTER_SCHED_POLICY = 'rr' node app.js
    ```
- Shared Socket（SS）:由操作系统内核来调度由那个进程处理请求
  - 设置方式
    ```
     // 直接在对应的cluster文件中设置
     cluster.schedulingPolicy = cluster.SCHED_NONE // cluster对象中schedulingPolicy为1
     // 设置启动命令
     env NODE_CLUSTER_SCHED_POLICY = 'none' node app.js
    ```

### Egg.js Cluster 模块的实现
```
+---------+           +---------+          +---------+
|  Master |           |  Agent  |          |  Worker |
+---------+           +----+----+          +----+----+
     |      fork agent     |                    |
     +-------------------->|                    |
     |      agent ready    |                    |
     |<--------------------+                    |
     |                     |     fork worker    |
     +----------------------------------------->|
     |     worker ready    |                    |
     |<-----------------------------------------+
     |      Egg ready      |                    |
     +-------------------->|                    |
     |      Egg ready      |                    |
     +----------------------------------------->|
```
Egg 在启动 Agent 进程时使用的是 child_process.fork() 做为 Master 进程秘书这样一个角色存在，不对外提供 HTTP 服务，当 Agent 进程创建成功与 Master 进程建立 IPC 通道之后，Master 进程利用 Nodejs Cluster 模块默认情况下根据 CPU 核心数来启动 Worker 进程，Worker 进程启动成功之后通过 IPC 通道通知 Master 进程，当这两类进程启动就绪之后，Master 进程通知 Agent、Worker 进程开始提供服务。

Master 进程退出之后，Worker 进程会自动退出，因为 Cluster 模块自己内部有处理。

 Agent 进程使用的 child_process.fork() 启动的，Master 进程退出之后，如果不做处理，Agent 进程不会退出，会被系统的 init 进程收养，此时就会变成孤儿进程，当然 Egg 没有这么弱，不会考虑不到这一点的，所以在 Master 退出之后也会做一些处理让 Agent 进程优雅退出。