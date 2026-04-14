const { getCache, setCache } = require('../services/cache')

const rateLimiter = async (req, res, next) => {
  const ip = req.ip
  const key = `rate:${ip}`

  try {
    const current = await getCache(key)

    if (current && current.count >= 10) {
      return res.status(429).json({ error: 'Too many requests. Try again in a minute.' })
    }

    if (!current) {
      await setCache(key, { count: 1 }, 60)
    } else {
      await setCache(key, { count: current.count + 1 }, 60)
    }

    next()
  } catch (err) {
    console.error('Rate limiter error:', err)
    next()
  }
}

module.exports = rateLimiter