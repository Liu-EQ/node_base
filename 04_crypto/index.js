// 该模块是C/C++实现之后，暴露给JS的模块接口，包括对OpenSSL的Hash、HMAC、加密、解密、签名、验证功能的一整套封装
// 不同的加密算法对应不同的api



// Cipher
// 对称加密
// AES(算法)/ECB(模式)/PKCS5Pading(填充量)
// 与JAVA、C#交互
// JAVA 采用AES 128 位填充模式：AES/CBC/PKCS5Padding 加密方法，在nodejs中采用对应的aes-128-cbc加密方法就能对上，因为使用向量（iv），但是NodeJS本身不支持自动填充，所以要采用createCipheriv方法，不能采用createCipher方法
function cipher(str) {
    try {
        const crypto = require('crypto')
        const key =  Buffer.from('12345677812345678', 'utf8')
        const iv = Buffer.from('12345678', 'utf8')

        const cipher = crypto.createCipheriv('aes-128-ccm', key, iv, {
            authTagLength: 16, // CCM 模式需要设置认证标签长度
        })

        let encryted = cipher.update(str, 'utf8', 'hex')

        encryted += cipher.final('hex')

        return encryted
    } catch (error) {
        console.log('eeor', error);
        return error.message || error

    }
}


function decipher(encrypted) {
    try {
        const crypto = require('crypto')
        const decipher = crypto.createDecipheriv('aes-128-ccm', '12345678', '')

        let decrypted = decipher.update(encrypted, 'hex', 'utf8')
        decipher += decipher.final('utf8')

        return decrypted
    } catch (error) {
        console.log('error', error);
        return error.message || error
    }
}


const originStr = 'hello world'
const encryptedStr = cipher(originStr)
const decryptedStr = decipher(encryptedStr)
console.log('crypto', originStr, encryptedStr, decryptedStr);


// MD5
// 让大容量信息在被数字签名软件签署私钥前被“压缩”成一种保密格式，将一个任意长度的字节串变换成为一定长度的十六进制数字串（32位字符）

// 不可逆，但是目前已经破解
// 唯一输入对应唯一输出

// 实现方式一：
// const crypto = require('crypto')


// crypto.createHash(md5)
