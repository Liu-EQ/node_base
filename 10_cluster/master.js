const fork = require('child_process').fork
const cpus = require('os').cpus()
const server = require('net').createServer().listen(3000)

for (let index = 0; index < cpus.length; index++) {
    const worker = fork('worker.js')
    worker.send('server', server)
    console.log('worker process created, pid: %s ppid: %s', worker.pid, process.ppid);
}