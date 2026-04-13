const { createClient } = require('redis')
require('dotenv').config()

const client = createClient({ url: process.env.REDIS_URL })

client.on('error', (err) => console.error('Redis error:', err))

client.connect().then(() => console.log('Redis connected'))

const setCache = async (key, value, ttlSeconds = 86400) => {
  await client.setEx(key, ttlSeconds, JSON.stringify(value))
}

const getCache = async (key) => {
  const data = await client.get(key)
  return data ? JSON.parse(data) : null
}

const deleteCache = async (key) => {
  await client.del(key)
}

module.exports = { setCache, getCache, deleteCache }