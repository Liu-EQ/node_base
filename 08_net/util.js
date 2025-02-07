const Transcoder = require('./coder.js')
const transcoder = new Transcoder()


const bufferHandler = function (buffer, overageBuffer, resultCallback) {
    if (overageBuffer) {
        buffer = Buffer.concat([overageBuffer, buffer])
    }
    let packageLength = 0
    const resultArray = []
    while (packageLength = transcoder.getPackageLength(buffer)) {
        const bufferPackage = buffer.slice(0, packageLength)
        const result = transcoder.decode(bufferPackage)
        buffer = buffer.slice(packageLength)
        console.log('result', result);
        resultArray.push(result)
    }
    overageBuffer = buffer
    resultCallback?.(result)
}

module.export = { bufferHandler: bufferHandler }