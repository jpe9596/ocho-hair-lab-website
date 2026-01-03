import express from 'express';
import cors from 'cors';
import { getDatabase } from './init-database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const db = getDatabase();

// ==================== CUSTOMER ACCOUNTS ====================

app.get('/api/customer-accounts', (req, res) => {
  try {
    const accounts = db.prepare('SELECT * FROM customer_accounts ORDER BY created_at DESC').all();
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching customer accounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/customer-accounts', (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO customer_accounts (email, password, name, phone)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(email, password, name, phone);
    
    const account = db.prepare('SELECT * FROM customer_accounts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating customer account:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.put('/api/customer-accounts/:email', (req, res) => {
  try {
    const { email } = req.params;
    const { password, name, phone } = req.body;
    
    const stmt = db.prepare(`
      UPDATE customer_accounts 
      SET password = COALESCE(?, password),
          name = COALESCE(?, name),
          phone = COALESCE(?, phone)
      WHERE email = ?
    `);
    
    stmt.run(password, name, phone, email);
    
    const account = db.prepare('SELECT * FROM customer_accounts WHERE email = ?').get(email);
    res.json(account);
  } catch (error) {
    console.error('Error updating customer account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/customer-accounts/:email', (req, res) => {
  try {
    const { email } = req.params;
    
    const stmt = db.prepare('DELETE FROM customer_accounts WHERE email = ?');
    stmt.run(email);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== STAFF MEMBERS ====================

app.get('/api/staff-members', (req, res) => {
  try {
    const members = db.prepare('SELECT * FROM staff_members ORDER BY created_at DESC').all();
    // Parse JSON fields
    const parsed = members.map(m => ({
      ...m,
      is_admin: Boolean(m.is_admin),
      availableServices: m.available_services ? JSON.parse(m.available_services) : undefined
    }));
    res.json(parsed);
  } catch (error) {
    console.error('Error fetching staff members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/staff-members', (req, res) => {
  try {
    const { username, password, name, role, isAdmin, availableServices } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO staff_members (username, password, name, role, is_admin, available_services)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      username, 
      password, 
      name, 
      role, 
      isAdmin ? 1 : 0, 
      availableServices ? JSON.stringify(availableServices) : null
    );
    
    const member = db.prepare('SELECT * FROM staff_members WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      ...member,
      is_admin: Boolean(member.is_admin),
      availableServices: member.available_services ? JSON.parse(member.available_services) : undefined
    });
  } catch (error) {
    console.error('Error creating staff member:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(409).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.put('/api/staff-members/:username', (req, res) => {
  try {
    const { username } = req.params;
    const { password, name, role, isAdmin, availableServices } = req.body;
    
    const updates = [];
    const values = [];
    
    if (password !== undefined) {
      updates.push('password = ?');
      values.push(password);
    }
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (isAdmin !== undefined) {
      updates.push('is_admin = ?');
      values.push(isAdmin ? 1 : 0);
    }
    if (availableServices !== undefined) {
      updates.push('available_services = ?');
      values.push(JSON.stringify(availableServices));
    }
    
    if (updates.length > 0) {
      values.push(username);
      const stmt = db.prepare(`UPDATE staff_members SET ${updates.join(', ')} WHERE username = ?`);
      stmt.run(...values);
    }
    
    const member = db.prepare('SELECT * FROM staff_members WHERE username = ?').get(username);
    res.json({
      ...member,
      is_admin: Boolean(member.is_admin),
      availableServices: member.available_services ? JSON.parse(member.available_services) : undefined
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/staff-members/:username', (req, res) => {
  try {
    const { username } = req.params;
    
    const stmt = db.prepare('DELETE FROM staff_members WHERE username = ?');
    stmt.run(username);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SALON SERVICES ====================

app.get('/api/salon-services', (req, res) => {
  try {
    const services = db.prepare('SELECT * FROM salon_services ORDER BY category, name').all();
    // Convert to frontend format
    const formatted = services.map(s => ({
      id: s.service_id,
      name: s.name,
      duration: s.duration,
      category: s.category,
      price: s.price
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching salon services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/salon-services', (req, res) => {
  try {
    const { id, name, duration, category, price } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO salon_services (service_id, name, duration, category, price)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(id, name, duration, category, price);
    
    const service = db.prepare('SELECT * FROM salon_services WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      id: service.service_id,
      name: service.name,
      duration: service.duration,
      category: service.category,
      price: service.price
    });
  } catch (error) {
    console.error('Error creating service:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(409).json({ error: 'Service already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.put('/api/salon-services/:serviceId', (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, duration, category, price } = req.body;
    
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (duration !== undefined) {
      updates.push('duration = ?');
      values.push(duration);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    
    if (updates.length > 0) {
      values.push(serviceId);
      const stmt = db.prepare(`UPDATE salon_services SET ${updates.join(', ')} WHERE service_id = ?`);
      stmt.run(...values);
    }
    
    const service = db.prepare('SELECT * FROM salon_services WHERE service_id = ?').get(serviceId);
    res.json({
      id: service.service_id,
      name: service.name,
      duration: service.duration,
      category: service.category,
      price: service.price
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/salon-services/:serviceId', (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const stmt = db.prepare('DELETE FROM salon_services WHERE service_id = ?');
    stmt.run(serviceId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== APPOINTMENTS ====================

app.get('/api/appointments', (req, res) => {
  try {
    const appointments = db.prepare('SELECT * FROM appointments ORDER BY date DESC, time DESC').all();
    // Parse JSON fields
    const parsed = appointments.map(a => ({
      id: a.appointment_id,
      customerName: a.customer_name,
      customerEmail: a.customer_email,
      customerPhone: a.customer_phone,
      password: a.password,
      service: a.service,
      services: JSON.parse(a.services),
      serviceDurations: a.service_durations ? JSON.parse(a.service_durations) : undefined,
      stylist: a.stylist,
      date: new Date(a.date),
      time: a.time,
      notes: a.notes,
      confirmationSent: Boolean(a.confirmation_sent),
      reminderSent: Boolean(a.reminder_sent),
      status: a.status,
      createdAt: new Date(a.created_at)
    }));
    res.json(parsed);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/appointments', (req, res) => {
  try {
    const {
      id,
      customerName,
      customerEmail,
      customerPhone,
      password,
      service,
      services,
      serviceDurations,
      stylist,
      date,
      time,
      notes,
      confirmationSent,
      reminderSent,
      status
    } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO appointments (
        appointment_id, customer_name, customer_email, customer_phone, password,
        service, services, service_durations, stylist, date, time, notes,
        confirmation_sent, reminder_sent, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      id,
      customerName,
      customerEmail,
      customerPhone,
      password,
      service,
      JSON.stringify(services),
      serviceDurations ? JSON.stringify(serviceDurations) : null,
      stylist,
      new Date(date).toISOString(),
      time,
      notes,
      confirmationSent ? 1 : 0,
      reminderSent ? 1 : 0,
      status || 'confirmed'
    );
    
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      id: appointment.appointment_id,
      customerName: appointment.customer_name,
      customerEmail: appointment.customer_email,
      customerPhone: appointment.customer_phone,
      password: appointment.password,
      service: appointment.service,
      services: JSON.parse(appointment.services),
      serviceDurations: appointment.service_durations ? JSON.parse(appointment.service_durations) : undefined,
      stylist: appointment.stylist,
      date: new Date(appointment.date),
      time: appointment.time,
      notes: appointment.notes,
      confirmationSent: Boolean(appointment.confirmation_sent),
      reminderSent: Boolean(appointment.reminder_sent),
      status: appointment.status,
      createdAt: new Date(appointment.created_at)
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/appointments/:appointmentId', (req, res) => {
  try {
    const { appointmentId } = req.params;
    const {
      customerName,
      customerEmail,
      customerPhone,
      service,
      services,
      serviceDurations,
      stylist,
      date,
      time,
      notes,
      confirmationSent,
      reminderSent,
      status
    } = req.body;
    
    const updates = [];
    const values = [];
    
    if (customerName !== undefined) {
      updates.push('customer_name = ?');
      values.push(customerName);
    }
    if (customerEmail !== undefined) {
      updates.push('customer_email = ?');
      values.push(customerEmail);
    }
    if (customerPhone !== undefined) {
      updates.push('customer_phone = ?');
      values.push(customerPhone);
    }
    if (service !== undefined) {
      updates.push('service = ?');
      values.push(service);
    }
    if (services !== undefined) {
      updates.push('services = ?');
      values.push(JSON.stringify(services));
    }
    if (serviceDurations !== undefined) {
      updates.push('service_durations = ?');
      values.push(JSON.stringify(serviceDurations));
    }
    if (stylist !== undefined) {
      updates.push('stylist = ?');
      values.push(stylist);
    }
    if (date !== undefined) {
      updates.push('date = ?');
      values.push(new Date(date).toISOString());
    }
    if (time !== undefined) {
      updates.push('time = ?');
      values.push(time);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }
    if (confirmationSent !== undefined) {
      updates.push('confirmation_sent = ?');
      values.push(confirmationSent ? 1 : 0);
    }
    if (reminderSent !== undefined) {
      updates.push('reminder_sent = ?');
      values.push(reminderSent ? 1 : 0);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    
    if (updates.length > 0) {
      values.push(appointmentId);
      const stmt = db.prepare(`UPDATE appointments SET ${updates.join(', ')} WHERE appointment_id = ?`);
      stmt.run(...values);
    }
    
    const appointment = db.prepare('SELECT * FROM appointments WHERE appointment_id = ?').get(appointmentId);
    res.json({
      id: appointment.appointment_id,
      customerName: appointment.customer_name,
      customerEmail: appointment.customer_email,
      customerPhone: appointment.customer_phone,
      password: appointment.password,
      service: appointment.service,
      services: JSON.parse(appointment.services),
      serviceDurations: appointment.service_durations ? JSON.parse(appointment.service_durations) : undefined,
      stylist: appointment.stylist,
      date: new Date(appointment.date),
      time: appointment.time,
      notes: appointment.notes,
      confirmationSent: Boolean(appointment.confirmation_sent),
      reminderSent: Boolean(appointment.reminder_sent),
      status: appointment.status,
      createdAt: new Date(appointment.created_at)
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/appointments/:appointmentId', (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const stmt = db.prepare('DELETE FROM appointments WHERE appointment_id = ?');
    stmt.run(appointmentId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== STAFF SCHEDULES ====================

app.get('/api/staff-schedules', (req, res) => {
  try {
    const schedules = db.prepare('SELECT * FROM staff_schedules ORDER BY stylist_name').all();
    // Parse JSON fields
    const parsed = schedules.map(s => ({
      stylistName: s.stylist_name,
      workingDays: JSON.parse(s.working_days),
      blockedDates: s.blocked_dates ? JSON.parse(s.blocked_dates) : []
    }));
    res.json(parsed);
  } catch (error) {
    console.error('Error fetching staff schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/staff-schedules', (req, res) => {
  try {
    const { stylistName, workingDays, blockedDates } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO staff_schedules (stylist_name, working_days, blocked_dates)
      VALUES (?, ?, ?)
      ON CONFLICT(stylist_name) DO UPDATE SET
        working_days = excluded.working_days,
        blocked_dates = excluded.blocked_dates
    `);
    
    stmt.run(
      stylistName,
      JSON.stringify(workingDays),
      JSON.stringify(blockedDates || [])
    );
    
    const schedule = db.prepare('SELECT * FROM staff_schedules WHERE stylist_name = ?').get(stylistName);
    res.json({
      stylistName: schedule.stylist_name,
      workingDays: JSON.parse(schedule.working_days),
      blockedDates: schedule.blocked_dates ? JSON.parse(schedule.blocked_dates) : []
    });
  } catch (error) {
    console.error('Error creating/updating staff schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/staff-schedules/:stylistName', (req, res) => {
  try {
    const { stylistName } = req.params;
    
    const stmt = db.prepare('DELETE FROM staff_schedules WHERE stylist_name = ?');
    stmt.run(stylistName);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting staff schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SMS LOGS ====================

app.get('/api/sms-logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM sms_logs ORDER BY sent_at DESC LIMIT 1000').all();
    const parsed = logs.map(log => ({
      appointmentId: log.appointment_id,
      type: log.type,
      templateName: log.template_name,
      customerName: log.customer_name,
      customerEmail: log.customer_email,
      serviceName: log.service_name,
      to: log.to_number,
      message: log.message,
      status: log.status,
      failureReason: log.failure_reason,
      sentAt: new Date(log.sent_at),
      deliveredAt: log.delivered_at ? new Date(log.delivered_at) : undefined
    }));
    res.json(parsed);
  } catch (error) {
    console.error('Error fetching SMS logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sms-logs', (req, res) => {
  try {
    const {
      appointmentId,
      type,
      templateName,
      customerName,
      customerEmail,
      serviceName,
      to,
      message,
      status,
      failureReason,
      deliveredAt
    } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO sms_logs (
        appointment_id, type, template_name, customer_name, customer_email,
        service_name, to_number, message, status, failure_reason, delivered_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      appointmentId,
      type,
      templateName,
      customerName,
      customerEmail,
      serviceName,
      to,
      message,
      status,
      failureReason,
      deliveredAt ? new Date(deliveredAt).toISOString() : null
    );
    
    const log = db.prepare('SELECT * FROM sms_logs WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      appointmentId: log.appointment_id,
      type: log.type,
      templateName: log.template_name,
      customerName: log.customer_name,
      customerEmail: log.customer_email,
      serviceName: log.service_name,
      to: log.to_number,
      message: log.message,
      status: log.status,
      failureReason: log.failure_reason,
      sentAt: new Date(log.sent_at),
      deliveredAt: log.delivered_at ? new Date(log.delivered_at) : undefined
    });
  } catch (error) {
    console.error('Error creating SMS log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ocho Hair Lab API server running on http://localhost:${PORT}`);
  console.log(`📦 Database: ${db.name}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  db.close();
  process.exit(0);
});
