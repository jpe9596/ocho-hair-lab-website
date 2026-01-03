import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'ocho-hair-lab.db');
const SCHEMA_PATH = path.join(__dirname, 'database.sql');

// Initialize database
export function initDatabase() {
  console.log('📦 Initializing database...');
  
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  
  // Read and execute schema
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
  
  console.log('✅ Database initialized successfully');
  
  // Insert default data
  seedDefaultData(db);
  
  return db;
}

function seedDefaultData(db) {
  console.log('🌱 Seeding default data...');
  
  // Default services
  const defaultServices = [
    { id: "1", name: "Retoque de Raiz", duration: 90, category: "Tinte", price: "$1,150" },
    { id: "2", name: "Full Head Tint", duration: 120, category: "Tinte", price: "$1,500" },
    { id: "3", name: "0% AMONIACO", duration: 90, category: "Tinte", price: "from $1,000" },
    { id: "4", name: "Toner/Gloss", duration: 60, category: "Tinte", price: "$450" },
    { id: "5", name: "Corte & Secado", duration: 60, category: "Corte & Styling", price: "$900" },
    { id: "6", name: "Secado (short)", duration: 30, category: "Corte & Styling", price: "$350" },
    { id: "7", name: "Secado (mm)", duration: 45, category: "Corte & Styling", price: "$500" },
    { id: "8", name: "Secado (long)", duration: 60, category: "Corte & Styling", price: "$700" },
    { id: "9", name: "Waves/peinado", duration: 45, category: "Corte & Styling", price: "from $350" },
    { id: "10", name: "Balayage", duration: 180, category: "Bespoke Color", price: "from $2,500" },
    { id: "11", name: "Baby Lights", duration: 150, category: "Bespoke Color", price: "from $3,500" },
    { id: "12", name: "Selfie Contour", duration: 120, category: "Bespoke Color", price: "$1,800" },
    { id: "13", name: "Posion Nº17", duration: 90, category: "Treatments", price: "$300" },
    { id: "14", name: "Posion Nº 8", duration: 60, category: "Treatments", price: "$900" }
  ];

  const insertService = db.prepare(`
    INSERT OR IGNORE INTO salon_services (service_id, name, duration, category, price)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const service of defaultServices) {
    insertService.run(service.id, service.name, service.duration, service.category, service.price);
  }

  // Default admin account
  const insertStaff = db.prepare(`
    INSERT OR IGNORE INTO staff_members (username, password, name, role, is_admin)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertStaff.run('admin', 'admin123', 'Admin', 'Owner', 1);

  // Default stylists
  const defaultStylists = [
    { username: 'maria.paula', password: 'stylist123', name: 'Maria Paula', role: 'Colorist' },
    { username: 'sofia', password: 'stylist123', name: 'Sofia', role: 'Stylist' }
  ];

  for (const stylist of defaultStylists) {
    insertStaff.run(stylist.username, stylist.password, stylist.name, stylist.role, 0);
  }

  console.log('✅ Default data seeded');
}

// Get database instance
export function getDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    return initDatabase();
  }
  
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  return db;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
  console.log('✅ Database initialization complete');
  process.exit(0);
}
