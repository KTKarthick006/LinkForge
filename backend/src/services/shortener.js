const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

const generateCode = (length = 6) => {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += BASE62[Math.floor(Math.random() * 62)]
  }
  return code
}

module.exports = { generateCode }