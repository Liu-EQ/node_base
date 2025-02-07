const computation = () => {
    let sum = 0;
    console.log('计算开始');
    console.time('计算耗时');

    for (let i = 0; i < 1e10; i++) {
        sum += i;
    }

    console.log('计算结束');
    console.time('计算耗时')
    return sum
}

process.on('message', () => {
    console.log(msg, 'process.pid', process.pid);
    const sum = computation()

    // 如果当前进程是通过进程间通信产生的，那么，process.send()方法可以用来给父进程发送消息
    process.send(sum);
})