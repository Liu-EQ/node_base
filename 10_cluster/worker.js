const http = require('http')
const server = http.createServer((req, res) => {
    res.end('I am worker, pid:' + process.pid + ', ppid: ' + process.ppid)
})

let worker
process.on('message', (message, sendHandler) => {
    if (message === 'server') {
        worker = sendHandler
        worker.on('connection', function (socket) {
            server.emit('connection', socket)
        })
    }
})
