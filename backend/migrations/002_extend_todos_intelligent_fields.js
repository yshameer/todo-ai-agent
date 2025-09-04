const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function extendTodosTable() {
  try {
    await client.connect();
    
    const addColumnsQuery = `
      ALTER TABLE todos
      ADD COLUMN IF NOT EXISTS original_text TEXT,
      ADD COLUMN IF NOT EXISTS parsed_data JSONB,
      ADD COLUMN IF NOT EXISTS validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('valid', 'warning', 'requires_attention', 'pending')),
      ADD COLUMN IF NOT EXISTS business_info JSONB,
      ADD COLUMN IF NOT EXISTS suggested_alternatives JSONB,
      ADD COLUMN IF NOT EXISTS scheduled_datetime TIMESTAMP,
      ADD COLUMN IF NOT EXISTS location_data JSONB;
    `;
    
    await client.query(addColumnsQuery);
    console.log('Todos table extended with intelligent fields successfully');
    
  } catch (error) {
    console.error('Error extending todos table:', error);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  extendTodosTable();
}

module.exports = extendTodosTable;