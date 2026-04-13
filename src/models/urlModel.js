const pool = require('./db')

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS urls (
      id SERIAL PRIMARY KEY,
      original_url TEXT NOT NULL,
      short_code VARCHAR(20) UNIQUE NOT NULL,
      alias VARCHAR(50) UNIQUE,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS clicks (
      id SERIAL PRIMARY KEY,
      short_code VARCHAR(20) NOT NULL,
      clicked_at TIMESTAMP DEFAULT NOW(),
      referrer TEXT,
      country VARCHAR(100),
      device VARCHAR(50)
    );
  `)
  console.log('Tables ready')
}

const insertUrl = async (originalUrl, shortCode, alias = null, expiresAt = null) => {
  const result = await pool.query(
    `INSERT INTO urls (original_url, short_code, alias, expires_at)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [originalUrl, shortCode, alias, expiresAt]
  )
  return result.rows[0]
}

const findByCode = async (code) => {
  const result = await pool.query(
    `SELECT * FROM urls WHERE short_code = $1 OR alias = $1`,
    [code]
  )
  return result.rows[0]
}

module.exports = { createTables, insertUrl, findByCode }