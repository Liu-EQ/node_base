const { Logger } = require('./Logger.js')

console.log('process test', process, process.stdout, process.stdout instanceof Function);


const logger = new Logger(process.stdout, process.stderr)

// logger.log('hello world') // 普通日志打印
// logger.info('hello world') // 等同于logger.log
// logger.error('hello world') // 错误日志打印
// logger.warn('hello world') // 等同于logger.error
// logger.trace('测试错误')
// logger.clear() // 清除控制台信息