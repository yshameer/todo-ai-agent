const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function addSmartFields() {
  try {
    await client.connect();
    
    const addColumnsQuery = `
      ALTER TABLE todos 
      ADD COLUMN IF NOT EXISTS original_text TEXT,
      ADD COLUMN IF NOT EXISTS date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS business JSONB,
      ADD COLUMN IF NOT EXISTS location JSONB,
      ADD COLUMN IF NOT EXISTS validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'warning', 'error'));
    `;
    
    await client.query(addColumnsQuery);
    console.log('Smart fields added to todos table successfully');
    
  } catch (error) {
    console.error('Error adding smart fields to todos table:', error);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  addSmartFields();
}

module.exports = addSmartFields;