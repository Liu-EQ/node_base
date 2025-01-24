// const EventEmitter = require('events').EventEmitter;
// const emiter = new EventEmitter();


// emiter.on('起床', (time) => {
//     console.log('早上起床:', time);
// })

// emiter.emit('起床', "6:00")

// // Stream 模块
// const EE = require('events')
// const util = require('util')

// function Stream(){
//     EE.call(this)
// }

// util.inherits(Stream, EE)



// 自定义模块
// const oneDayPlan = {
//    '6:00':function(){
//     console.log('早上起床')
//    },
//     '6:30':function(){
//         console.log('吃早餐')
//     },
//     '9:00':function(){
//         console.log('上班')
//     },
//     '12:00':function(){
//         console.log('吃午餐')
//     },
//     '18:00':function(){
//         console.log('下班')
//     },
//     '19:00':function(){
//         console.log('吃晚餐')
//     },
//     '22:00':function(){
//         console.log('睡觉')
//     }
// }

// function OneDayPlan(){
//     EventEmitter.call(this)
// }

// Object.setPrototypeOf(OneDayPlan.prototype, EventEmitter.prototype)
// Object.setPrototypeOf(OneDayPlan, EventEmitter)

// module.exports = OneDayPlan

// 高并发下的雪崩问题：缓存失效导致的对于数据库的大量请求，利用NodeJS中的once可以进行解决
// const events = require('events')
// const emitter = new events.EventEmitter()
// const fs = require('fs')
// const status = {}

// const select = function (file, filename, cb) {
//     emitter.once(file, cb);

//     if (status[file] === undefined) {
//         status[file] = 'ready'; // 不存在设置默认值
//     }
//     if (status[file] === 'ready') {
//         status[file] = 'pending';
//         fs.readFile(file, function (err, result) {
//             console.log(filename);
//             emitter.emit(file, err, result.toString());
//             status[file] = 'ready';

//             setTimeout(function () {
//                 delete status[file];
//             }, 1000);
//         });
//     }
// }

// for (let i = 1; i <= 11; i++) {
//     if (i % 2 === 0) {
//         select(`/tmp/a.txt`, 'a 文件', function (err, result) {
//             console.log('err: ', err, 'result: ', result);
//         });
//     } else {
//         select(`/tmp/b.txt`, 'b 文件', function (err, result) {
//             console.log('err: ', err, 'result: ', result);
//         });
//     }
// }
// 雪崩问题的解决思路主要是在于使用异步方式进行回调，异步操作的这段时间会组织相同操作再次发生


// 循环调用
// 循环调用情况可以理解为时间切片，在回调添加时间点之后的emit可以被监听到，之前的是不会被监听的


// 事件的同步还是异步
// EventEmitter 会按照监听器的注册顺序同步的调用所有的监听器，所以必须确保事件的排序正确，避免竞态条件
// 可以使用setImmediate 或者 process.nextTick 切换到异步模式


// 添加error监听，用于处理错误

