const EventEmitter = require('events').EventEmitter;
const emiter = new EventEmitter();


emiter.on('起床', (time) => {
    console.log('早上起床:', time);
})

emiter.emit('起床', "6:00")