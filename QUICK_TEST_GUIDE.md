# Quick Test Guide - Ocho Hair Lab

## 🚀 Quick Start (2 Minutes)

### Step 1: Initialize System
1. Go to website homepage
2. Scroll to footer, click **"Staff Login"**
3. Login: `owner@ocholab.com` / `owner123`
4. Click **"Test System"** button (top right)
5. Review diagnostic results:
   - ✅ Green = Good
   - ⚠️ Yellow = Needs attention
   - ❌ Red = Must fix

### Step 2: Fix Any Issues
Based on diagnostic results:

**If "No services configured":**
- Go to **Services** tab
- Services should auto-load from defaults
- If not, refresh page

**If "No staff schedules":**
- Go to **Staff Schedules** tab  
- Select "Maria" from dropdown
- Schedules auto-initialize with 9 AM - 6 PM Mon-Sat
- Verify she's working

**If "No services assigned to staff":**
- Go to **Staff & Accounts** tab
- Click "Manage Services" for Maria
- Check the services she offers
- Save

### Step 3: Test Booking Flow
1. **Logout** → Exit Admin → Home
2. Click **"Book Appointment"** (big button on homepage)
3. Select **Stylist**: Maria
4. Select **Services**: Choose any (1 or more)
5. Select **Date**: Pick any day this week
6. Select **Time**: Choose from available slots
7. Fill in **Customer Info**:
   - Name: Test Customer
   - Email: test@test.com
   - Phone: 8116153747
   - Password: test123
8. Click **"Book Appointment"**
9. Should see success message
10. Auto-redirects to login page

### Step 4: Verify Appointment Shows
1. **Login** with test@test.com / test123
2. Should see appointment in "Upcoming Appointments"
3. Should show: service(s), stylist, date, time

**✅ If you see the appointment = CORE SYSTEM WORKS**

---

## 🔍 Testing Service Duration Changes

### Test Flow:
1. Login as admin
2. Go to **Services** tab
3. Find "Full Head Tint" (120 min default)
4. Click **Edit** → Change to **180 minutes** → Save
5. Logout, book "Full Head Tint" service
6. Duration should use 180 minutes
7. **Old appointments** keep their original 120 min duration ✓

---

## 👥 Testing Staff Dashboard

### Test Flow:
1. Scroll to footer → **Staff Login**
2. Login: `maria` / `supersecret`
3. Should see Maria's dashboard
4. Should show appointments assigned to Maria
5. Each appointment should display:
   - Customer name
   - Customer email & phone
   - Service(s)
   - Date & time
   - Notes (if any)

**✅ If details show = STAFF VIEW WORKS**

---

## 🎯 Common Issues & Fixes

### Issue: "No available slots" when booking
**Causes:**
- No schedule configured for stylist
- Selected date is blocked
- All slots are booked
- Stylist not working that day

**Fix:** 
- Admin → Staff Schedules → Select stylist → Verify working hours

### Issue: Customer can't see appointments after booking
**Cause:** Email normalization mismatch

**Check:**
1. Admin → Analytics → Find the appointment
2. Note the customerEmail
3. Have customer login with EXACT same email
4. Should use lowercase, no spaces

**Fix:** System now auto-normalizes (lowercase + trim)

### Issue: Services don't filter by stylist
**Cause:** Staff member has no availableServices assigned

**Fix:**
- Admin → Staff & Accounts
- Click "Manage Services" for that stylist
- Select services they offer
- Save

### Issue: Only "Any Available" shows, no stylists
**Cause:** All staff have `isAdmin: true` OR no staff exist

**Fix:**
- Admin → Staff & Accounts
- Create new stylist (NOT admin)
- Should appear in booking dropdown

---

## 📊 What the Diagnostic Tool Checks

1. **Staff Members**: At least 1 non-admin stylist exists
2. **Services**: Service list initialized with defaults
3. **Schedules**: Each stylist has working hours configured
4. **Service Assignments**: Each stylist has services they can perform
5. **Customer Accounts**: Tracks registered customers
6. **Appointments**: Shows total and upcoming count
7. **Data Integrity**: Checks for missing fields in appointments
8. **Email Normalization**: Ensures emails are lowercase/trimmed

---

## 🧪 Quick Smoke Test (3 minutes)

Run this sequence to verify everything works:

```
1. ✓ Login as admin
2. ✓ Click "Test System" - All green/yellow (no red)
3. ✓ Logout
4. ✓ Book appointment as NEW customer
5. ✓ Login with new account
6. ✓ See appointment in profile
7. ✓ Click "Reschedule"
8. ✓ Pick new date/time - Save
9. ✓ Click "Cancel" on appointment
10. ✓ Appointment disappears
```

**If all 10 steps work = SYSTEM FULLY FUNCTIONAL** ✅

---

## 🔧 Advanced Testing

### Test Multiple Services in One Appointment
1. Book appointment
2. Select stylist
3. Check MULTIPLE services (not just one)
4. Complete booking
5. Verify all services show in appointment details

### Test Service Duration Impact
1. Admin → Services → Edit any service → Change duration
2. Book that service
3. Admin dashboard should show new duration
4. Old appointments should keep old duration

### Test Staff Without Services
1. Admin → Staff & Accounts → Create new stylist
2. Don't assign any services
3. Try to book with that stylist
4. Should show "No services configured" message

### Test Appointment Cancellation
1. Customer profile → Cancel appointment
2. Should send WhatsApp cancellation (if Twilio configured)
3. Should disappear from customer view
4. Should disappear from staff dashboard
5. Should still show in admin (for records)

---

## 📱 Testing WhatsApp Notifications

**Note:** WhatsApp requires valid Twilio account with approved template

### When notifications are sent:
- ✅ Booking confirmed
- ✅ Appointment rescheduled
- ✅ Appointment cancelled
- ✅ 8 hours before appointment (reminder)

### If notifications fail:
- System continues to work
- User sees success message anyway
- Error logged in console (for debugging)

---

## 🗄️ Data Structure Reference

### Customer Account
```typescript
{
  email: string (lowercase, trimmed)
  password: string
  name: string
  phone: string
}
```

### Appointment
```typescript
{
  id: string
  customerName: string
  customerEmail: string (lowercase, trimmed)
  customerPhone: string
  password: string
  service: string (first service)
  services: string[] (all services)
  serviceDurations: { [serviceName]: minutes }
  stylist: string
  date: Date
  time: string
  notes: string
  status: "confirmed" | "completed" | "cancelled"
  confirmationSent: boolean
  reminderSent: boolean
}
```

### Staff Member
```typescript
{
  username: string
  password: string
  name: string
  role: string
  isAdmin: boolean
  availableServices: string[]
}
```

### Service
```typescript
{
  id: string
  name: string
  duration: number (minutes)
  category: string
  price: string
}
```

---

## 🚨 Emergency Commands

### View All Data (Browser Console)
```javascript
// See all KV keys
const keys = await spark.kv.keys()
console.log(keys)

// See specific data
const appointments = await spark.kv.get('appointments')
console.log('Appointments:', appointments)

const customers = await spark.kv.get('customer-accounts')
console.log('Customers:', customers)

const staff = await spark.kv.get('staff-members')
console.log('Staff:', staff)
```

### Reset Specific Data
```javascript
// ⚠️ WARNING: This deletes data permanently!

// Reset all appointments
await spark.kv.delete('appointments')

// Reset customer accounts
await spark.kv.delete('customer-accounts')

// Reset services (will reinit on page load)
await spark.kv.delete('salon-services')

// Then refresh page
location.reload()
```

---

## ✅ Success Criteria

Your system is working correctly if:

- [x] Can login as admin and see dashboard
- [x] Diagnostic tool shows mostly green/yellow (no red)
- [x] Can create new staff members
- [x] Can modify service durations
- [x] Can book appointment as new customer
- [x] Customer can login and see their appointments
- [x] Staff can login and see assigned appointments
- [x] Admin can see all appointments
- [x] Can reschedule appointments
- [x] Can cancel appointments
- [x] Service changes don't break old appointments
- [x] Multiple services can be booked together

---

## 📞 Support

If issues persist:
1. Run diagnostic tool first
2. Check browser console for errors (F12)
3. Verify all red diagnostic items are fixed
4. Try emergency reset if data is corrupted
5. Reference COMPREHENSIVE_TEST_PLAN.md for detailed testing
