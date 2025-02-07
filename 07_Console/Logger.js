const util = require('util')

/**
 * 初始化Logger对象
 * @param {*} stdout
 * @param {*} stderr
 */
function Logger(stdout, stderr) {
    // step1 检查当前对象是否为Logger实例 确保this指向恒定指向Logger实例
    if (!(this instanceof Logger)) {
        return new Logger(stdout, stderr)
    }
    // step2 检查是否是一个可写流实例
    if (!stdout || !(stdout instanceof Object)) {
        throw new Error('Logger expects a writable stream instance')
    }
    // step3 兼容stderr，如果没有指定stderr，则指定为stdout
    if (!stderr) {
        stderr = stdout
    }
    // stepp4 设置JS Object的属性
    let props = {
        writable: true,
        enumerable: false,
        configurable: false
    }
    // step5 Logger对象定义_stdout属性
    Object.defineProperty(this, '_stdout', Object.assign(props, {
        value: stdout
    }))
    // step6 Logger对象定义_stderr属性
    Object.defineProperty(this, '_stderr', Object.assign(props, {
        value: stderr
    }))
    // step7 Logger对象定义_times属性
    Object.defineProperty(this, '_times', Object.assign(props, {
        value: new Map()
    }))
    // step7 将原型方法上的属性绑定到Logger实例上
    const keys = Object.keys(Logger.prototype)
    for (const key in keys) {
        this[keys[key]] = this[keys[key]].bind(this)
    }
}

// 定义原型对象的log方法
Logger.prototype.log = function () {
    this._stdout.write(util.format.apply(this, arguments) + '\n')
}
Logger.prototype.info = Logger.prototype.log

// 定义原型对象的warn方法
Logger.prototype.warn = function () {
    this._stdout.write(util.format.apply(this, arguments) + '\n')
}
Logger.prototype.error = Logger.prototype.warn

// 定义原型对象的trace方法
Logger.prototype.trace = function trace(...args) {
    const err = {
        name: 'Trace',
        message: util.format.apply(null, args)
    }

    // V8自带API
    Error.captureStackTrace(err, trace)

    this.error(err.stack)
}

// 定义原型对象的clear方法
Logger.prototype.clear = function () {
    // 如果stdout输出在控制台上，执行clear方法，否则不执行
    if (!this._stdout.isTTY) return;
    // readline模块
    const { cursorTo, clearScreenDown } = require('readline')
    cursorTo(this._stdout, 0, 0)
    clearScreenDown(this._stdout)
}

// 定义原型对象的dir方法
Logger.prototype.dir = function (object, options) {
    options = Object.assign({ customInspect: false }, options)
    /**
     * util.inspect(object, [showHidden], [depth], [colors]) 是一个将任意对象转换为字符串的方法，通常用于调试和错误的输出
     * showHidden —— optional parameters 为true，会输出更多的隐藏信息
     * depth —— 最大递归层数，如果对象复杂，可以指定层数控制输出信息的多少，默认会递归3层，设置为null，不限制递归层数，遍历完整对象
     * color —— 为true，输出会以ansi颜色编码进行展示 
     */
    this._stdout.write(util.inspect(object, options) + '\n');
}

// 定义原型对象的time方法
Logger.prototype.time = function (label) {
    // process.hrtime() 返回当前时间以[seconds, nanoseconds] tuple Array表示的高精度解析值，nanoseconds是当前时间无法使用秒表示的剩余部分
    this._times.set(label, process.hrtime())
}
Logger.prototype.timeEnd = function (label) {
    const time = this._times.get(label)

    if (!time) {
        process.emitWarning(`No such label'${label}'for console.timeEnd()`)
        return;
    }

    const duration = process.hrtime(time)
    const ms = duration[0] * 1000 + duration[1] / 1e6; // 1e6 = 10000000 .0 1e6 是 1*10^6
    this.log('%s %sms', label, ms.toFixed(3));
    this._times.delete(label)
}

module.exports = new Logger(process.stdout, process.stderr)

module.exports.Logger = Logger