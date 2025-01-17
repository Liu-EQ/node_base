console.log('a 模块 start');

exports.test = 1;

undeclaredVariable = 1;

const b = require('./b.js');

console.log('a 模块 加载完毕，b.test值：', b.test);
