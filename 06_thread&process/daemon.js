const fs = require('fs')
const { Console } = require('console')

const logger = new Console(fs.createWriteStream('./stdout.log'), fs.createWriteStream('./stderr.log'))

setInterval(() => {
    logger.log('daemon pid:', process.pid, ', ppid: ', process.ppid)
}, 1000 * 10);