const fs = require('fs');
const path = require('path');
const db = require('../db');

async function runMigration() {
  const filename = process.argv[2] || '003_content_and_models.sql';
  console.log(`[Migration] Запуск миграции ${filename}...`);
  try {
    const sqlPath = path.join(__dirname, '../migrations', filename);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await db.query(sql);
    console.log(`[Migration] ✓ Миграция ${filename} успешно выполнена!`);
    process.exit(0);
  } catch (err) {
    console.error(`[Migration] ✗ Ошибка выполнения миграции ${filename}:`, err);
    process.exit(1);
  }
}

runMigration();
