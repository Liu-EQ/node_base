console.log('b 模块 start');

exports.test = 2;

const a = require('./a.js');

console.log(undeclaredVariable, 'undeclaredVariable');


console.log('b 模块 end: a.test:', a.test);
