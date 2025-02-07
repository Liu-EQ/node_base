## DNS

### DNS简介
- 域名解析服务
- 基于UDP协议实现

### NodeJS DNS模块两大类别
- 使用底层操作系统工具进行域名解析
    ```
    const dns = require('dns');

    // 如果本地的hosts文件被修改，dns.lookup会拿本地的hosts文件的域名映射
    dns.lookup('nodejs.red', (err, address, family) => {
        console.log('地址：%j 地址族：IPv%s', address, family )
    })
    ```
- 连接到一个DNS网络服务器进行域名解析
  dns模块中除了dns.lookup之外的所有函数，都会连接到实际的DNS服务器以执行域名接续并始终使用网络执行DNS查询
    ```
    const dns = require('dns');

    dns.resolve('www.nodejs.red', (err, records) => {
        console.log('records')
    })
    ```

### dns.lookup() 与 dns.resolve()
- dns.lookup() 是以异步形式调用，但是在内部libuv底层线程池中，是以同步形式调用getaddrinfo(3)，所以可能会有一些不确定因素造成Node进程阻塞
- dns.resolve() 不会调用getaddrinfo(3)，所以始终是保持异步，不会对其他进程产生负面影响

### DNS解析过程
DNS域名解析步骤：浏览器DNS缓存——>系统(OS)缓存——>ISP DNS缓存
>ISP DNS缓存 是指由互联网服务提供商（ISP）维护的域名系统（DNS）缓存