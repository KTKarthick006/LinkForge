const { Worker } = require('bullmq')
const pool = require('../models/db')
require('dotenv').config()

const worker = new Worker('analytics', async (job) => {
  const { shortCode, referrer, userAgent, ip } = job.data

  let country = 'Unknown'
  let device = 'Unknown'

  try {
    const geoip = require('geoip-lite')
    const ua = require('ua-parser-js')

    const geo = geoip.lookup(ip)
    country = geo ? geo.country : 'Unknown'

    const parsed = ua(userAgent)
    device = parsed.device.type || 'desktop'
  } catch (e) {}

  await pool.query(
    `INSERT INTO clicks (short_code, referrer, country, device)
     VALUES ($1, $2, $3, $4)`,
    [shortCode, referrer || null, country, device]
  )

  console.log(`Click recorded: ${shortCode} | ${country} | ${device}`)
}, {
  connection: { url: process.env.REDIS_URL }
})

worker.on('completed', (job) => console.log(`Job ${job.id} done`))
worker.on('failed', (job, err) => console.error(`Job ${job.id} failed:`, err.message))

module.exports = worker