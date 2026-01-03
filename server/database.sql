-- Ocho Hair Lab Website Database Schema
-- SQLite database for standalone deployment

-- Customer Accounts Table
CREATE TABLE IF NOT EXISTS customer_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_email ON customer_accounts(email);

-- Staff Members Table
CREATE TABLE IF NOT EXISTS staff_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    available_services TEXT, -- JSON array of service names
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_username ON staff_members(username);

-- Salon Services Table
CREATE TABLE IF NOT EXISTS salon_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_name ON salon_services(name);
CREATE INDEX idx_service_category ON salon_services(category);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    password TEXT, -- for customer account creation
    service TEXT NOT NULL, -- primary service name
    services TEXT NOT NULL, -- JSON array of service names
    service_durations TEXT, -- JSON object of service:duration mapping
    stylist TEXT NOT NULL,
    date TEXT NOT NULL, -- ISO date string
    time TEXT NOT NULL,
    notes TEXT,
    confirmation_sent BOOLEAN DEFAULT 0,
    reminder_sent BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'confirmed', -- confirmed, completed, cancelled
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointment_email ON appointments(customer_email);
CREATE INDEX idx_appointment_date ON appointments(date);
CREATE INDEX idx_appointment_status ON appointments(status);

-- Staff Schedules Table
CREATE TABLE IF NOT EXISTS staff_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stylist_name TEXT NOT NULL,
    working_days TEXT NOT NULL, -- JSON object with day:schedule mapping
    blocked_dates TEXT, -- JSON array of blocked date strings
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stylist_name)
);

CREATE INDEX idx_schedule_stylist ON staff_schedules(stylist_name);

-- SMS Logs Table
CREATE TABLE IF NOT EXISTS sms_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id TEXT NOT NULL,
    type TEXT NOT NULL, -- confirmation, reminder, custom
    template_name TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    service_name TEXT NOT NULL,
    to_number TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL, -- sent, delivered, failed, pending
    failure_reason TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivered_at DATETIME
);

CREATE INDEX idx_sms_appointment ON sms_logs(appointment_id);
CREATE INDEX idx_sms_status ON sms_logs(status);
CREATE INDEX idx_sms_type ON sms_logs(type);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_customer_accounts_timestamp 
    AFTER UPDATE ON customer_accounts
    FOR EACH ROW
    BEGIN
        UPDATE customer_accounts SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_staff_members_timestamp 
    AFTER UPDATE ON staff_members
    FOR EACH ROW
    BEGIN
        UPDATE staff_members SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_salon_services_timestamp 
    AFTER UPDATE ON salon_services
    FOR EACH ROW
    BEGIN
        UPDATE salon_services SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_appointments_timestamp 
    AFTER UPDATE ON appointments
    FOR EACH ROW
    BEGIN
        UPDATE appointments SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_staff_schedules_timestamp 
    AFTER UPDATE ON staff_schedules
    FOR EACH ROW
    BEGIN
        UPDATE staff_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
