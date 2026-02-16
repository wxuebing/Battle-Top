const crypto = require('crypto')

const nextauthSecret = crypto.randomBytes(64).toString('hex')
const devMasterKey = crypto.randomBytes(32).toString('hex')

console.log('=== 生产环境密钥 ===')
console.log('')
console.log('NEXTAUTH_SECRET=' + nextauthSecret)
console.log('')
console.log('DEV_MASTER_KEY=' + devMasterKey)
console.log('')
console.log('请将以上密钥保存到 .env.production 文件中')
