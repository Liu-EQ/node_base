class Transcoder {
    constructor() {
        this.packageHeaderLen = 4; // 包头长度
        this.serialNumber = 0; // 定义包序号
        this.packageSerialNumberLen = 2; // 包头序号所占用的字符
    }

    /**
     * 编码
     * @param { Object } data Buffer 对象数据
     * @param { Int } serialNumber 包序号，客户端编码时自动生成，服务端解码之后在编码时需要传入包序号
     */
    encode(data, serialNumber) {
        // Buffer.from 从已有的数据创建Buffer
        const body = Buffer.from(data)
        // Buffer.alloc 分配指定大小的新Buffer，整个包头是四个字节，前两个字节是包序号，后两个字节是数据体长度
        const header = Buffer.alloc(this.packageHeaderLen)
        header.writeInt16BE(serialNumber || this.serialNumber) // 将包序号写入包头的前两个字节
        header.writeInt16BE(body.length, this.packageSerialNumberLen) // 跳过包序号前两位，也就是上一步操作写入的包序号
        if (serialNumber === undefined) {
            this.serialNumber++
        }
        // Buffer类的静态方法，将多个Buffer对象合并成一个单一的Buffer Buffer.concat(list[, totalLength])
        return Buffer.concat([header, body])
    }

    /**
     * 解码
     * @param { Object } buffer
     */
    decode(buffer) {
        const header = buffer.slice(0, this.packageHeaderLen)
        const body = buffer.slice(this.packageHeaderLen)

        return {
            // 读取前两个字节，获取到包序号
            serialNumber: header.readInt16BE(),
            // 跳过包头前两个字节，读取后两个字节，获取数据体长度
            bodyLength: header.readInt16BE(this.packageSerialNumberLen), // 编码阶段跳过前两位，所以解码阶段同样跳过
            body: body.toString()
        }
    }

    /**
     * 获取包长度的两种情况
     * 1. 如果当前buffer长度小于包头，肯定不是一个完整的数据包，因此直接返回 0 不做处理（可能数据还未接收完等等）
     * 2. 否则返回这个完整的数据包长度
     * @param { * } buffer
     */
    getPackageLength(buffer) {
        if (buffer.length < this.packageHeaderLen) {
            return 0
        }
        return this.packageHeaderLen + buffer.readInt16BE(this.packageSerialNumberLen)
    }

}

module.exports = Transcoder
