# Comprehensive Test Plan for Ocho Hair Lab

## Pre-Test Setup Required

### 1. Initialize Services in Admin Panel
**CRITICAL**: Before testing booking functionality, you must:
1. Login as admin (owner@ocholab.com / owner123) via Staff Login
2. Go to Admin Dashboard → Services tab
3. Verify all services from the landing page are present with correct durations
4. If services are missing, they should auto-initialize from DEFAULT_SERVICES

### 2. Configure Staff Schedules
1. Still logged in as admin, go to Staff Management → Schedules tab
2. For Maria: Set working hours (e.g., Mon-Fri 9:00 AM - 6:00 PM)
3. For Paula: Set working hours (e.g., Mon-Fri 9:00 AM - 6:00 PM)
4. Add any break times if needed
5. **WITHOUT SCHEDULES, NO TIME SLOTS WILL BE AVAILABLE**

### 3. Assign Services to Staff
1. In Admin Dashboard → Staff & Accounts tab
2. Click "Manage Services" for Maria
3. Select which services Maria can perform
4. Repeat for Paula
5. **STYLISTS CAN ONLY BOOK SERVICES ASSIGNED TO THEM**

---

## Test Flow 1: New Customer Booking

### Step 1: Access Booking Page
- [ ] Click "Book Appointment" button on landing page
- [ ] Should navigate to `#booking` page
- [ ] Should NOT see name/email/phone fields yet (only for logged out users)

### Step 2: Select Stylist
- [ ] Dropdown should show: "Any Available", "Maria", "Paula"
- [ ] If showing old stylists, there's a bug in staff member loading
- [ ] Select "Maria"

### Step 3: Select Service(s)
- [ ] Services should be grouped by category (Tinte, Corte & Styling, etc.)
- [ ] Only services assigned to Maria should appear
- [ ] Select one or multiple services using checkboxes
- [ ] **BUG CHECK**: If all services show regardless of stylist assignment, service filtering is broken

### Step 4: Select Date
- [ ] Week calendar should show 7 days starting from today
- [ ] Dates where Maria has blocked time should be disabled
- [ ] **BUG CHECK**: If "No available slots" appears for all dates, schedules aren't configured

### Step 5: Select Time
- [ ] Time dropdown should populate with available slots
- [ ] Should respect Maria's working hours
- [ ] Should exclude Maria's break times
- [ ] Should exclude already booked slots
- [ ] **BUG CHECK**: If empty, either no schedule exists or all slots are booked

### Step 6: Enter Customer Info (New Users Only)
- [ ] Name field (required)
- [ ] Email field (required)
- [ ] Phone field (required, format: +521XXXXXXXXXX)
- [ ] Password field (required, min 6 characters)
- [ ] Notes field (optional)

### Step 7: Submit Booking
- [ ] Click "Book Appointment" button
- [ ] Should show success toast
- [ ] Should mention WhatsApp confirmation
- [ ] Should auto-redirect to #customer-login after 2 seconds
- [ ] Account should be auto-created in customer-accounts KV

### Step 8: Verify Appointment Saved
- [ ] Login with email and password you just created
- [ ] Should see appointment in "Upcoming Appointments" section
- [ ] **CRITICAL BUG CHECK**: If not showing, appointment isn't being saved correctly
- [ ] Appointment should show: service(s), stylist, date, time

---

## Test Flow 2: Returning Customer Booking

### Step 1: Login First
- [ ] Click "Customer Login" button (top right)
- [ ] Enter email and password from Test Flow 1
- [ ] Should see customer profile with existing appointments

### Step 2: Book New Appointment
- [ ] Click "+ Book New" button
- [ ] Should navigate to booking page
- [ ] Should automatically fill name, email, phone (from account)
- [ ] **BUG CHECK**: If these fields are visible and empty, auto-fill is broken

### Step 3: Complete Booking
- [ ] Follow steps 2-5 from Test Flow 1
- [ ] Should NOT need to re-enter personal info or password
- [ ] Submit booking
- [ ] Should redirect to #profile automatically
- [ ] New appointment should appear in list

---

## Test Flow 3: Service Duration Changes

### Step 1: Admin Changes Service Duration
- [ ] Login as owner@ocholab.com / owner123
- [ ] Go to Services tab
- [ ] Find "Full Head Tint" (default: 120 minutes)
- [ ] Click edit, change duration to 180 minutes
- [ ] Save changes

### Step 2: Verify in Booking Flow
- [ ] Logout, go to booking page
- [ ] Book "Full Head Tint" service
- [ ] The time calculation should use 180 minutes
- [ ] **Note**: This affects slot availability but doesn't block overlapping times in current implementation

### Step 3: Check Existing Appointments
- [ ] Existing appointments with old duration should keep their original duration
- [ ] Check admin panel - old appointments should show stored duration from serviceDurations field
- [ ] **BUG CHECK**: If appointments don't have serviceDurations field, they can't track duration changes

---

## Test Flow 4: Staff Dashboard View

### Step 1: Login as Staff
- [ ] Go to footer, click "Staff Login"
- [ ] Login as maria / supersecret
- [ ] Should see Maria's dashboard

### Step 2: Verify Appointment Details
- [ ] Should see all appointments assigned to Maria
- [ ] Each appointment should show:
  - [ ] Customer name
  - [ ] Customer email
  - [ ] Customer phone
  - [ ] Service(s) booked
  - [ ] Date and time
  - [ ] Notes (if any)
- [ ] **BUG CHECK**: If missing customer details, the display logic is incomplete

### Step 3: Mark Appointment as Complete
- [ ] Click "Mark Complete" on a past appointment
- [ ] Should update status to "completed"
- [ ] Should move to "Past Appointments" section

---

## Test Flow 5: Admin Panel Functions

### Step 1: View All Appointments
- [ ] Login as owner@ocholab.com / owner123
- [ ] Admin Dashboard should show all appointments from all stylists
- [ ] Should show customer contact info
- [ ] Should show reminder status badge if reminder was sent

### Step 2: Manage Staff Members
- [ ] Go to Staff & Accounts tab
- [ ] Create new staff member:
  - [ ] Username: test
  - [ ] Password: test123
  - [ ] Name: Test Stylist
  - [ ] Role: Stylist
  - [ ] Assign services to them
- [ ] New stylist should appear in booking dropdown immediately
- [ ] **BUG CHECK**: If not appearing, KV sync or staffMembers filtering issue

### Step 3: Manage Services
- [ ] Go to Services tab
- [ ] Create new service:
  - [ ] Name: Test Service
  - [ ] Duration: 90 minutes
  - [ ] Category: Treatments
  - [ ] Price: $500
- [ ] Should appear in service list
- [ ] Should be available to assign to stylists

### Step 4: Delete Appointments
- [ ] Find an appointment in admin panel
- [ ] Click trash icon
- [ ] Should delete immediately
- [ ] Should disappear from customer's profile
- [ ] Should disappear from stylist's dashboard

---

## Test Flow 6: Customer Account Management

### Step 1: Password Reset
- [ ] Login to customer profile
- [ ] Click "Change Password"
- [ ] Enter current password
- [ ] Enter new password (min 6 chars)
- [ ] Confirm new password
- [ ] Should update successfully
- [ ] Logout and login with new password to verify

### Step 2: Cancel Appointment
- [ ] In customer profile, find upcoming appointment
- [ ] Click "Cancel" button
- [ ] Confirm cancellation in dialog
- [ ] Should send WhatsApp cancellation message
- [ ] Should remove from upcoming appointments
- [ ] **BUG CHECK**: If still showing, cancellation isn't removing properly

### Step 3: Reschedule Appointment
- [ ] Find upcoming appointment
- [ ] Click "Reschedule" button
- [ ] Select new date and time
- [ ] Submit
- [ ] Should update appointment details
- [ ] Should send WhatsApp reschedule notification
- [ ] Should reset reminderSent flag to false

---

## Known Issues to Check

### Issue 1: Appointments Not Appearing in Customer Profile
**Symptoms**: Customer books appointment, admin can see it, but customer can't see it in their profile

**Root Cause**: Email normalization mismatch
- Appointments save with: `customerEmail.toLowerCase().trim()`
- Profile filters by: `customerData.email.toLowerCase().trim()`
- If one is missing normalization, match fails

**Fix Check**: 
```typescript
// In CustomerProfile.tsx line ~117
const userAppointments = (appointments || []).filter(apt => 
  apt.customerEmail?.toLowerCase().trim() === customerData.email?.toLowerCase().trim()
)
```

### Issue 2: No Available Time Slots
**Symptoms**: Calendar shows dates but time dropdown is empty

**Possible Causes**:
1. No staff schedule configured for that stylist
2. Selected date is in stylist's blocked dates
3. All time slots are booked
4. Stylist is not working that day of week

**Fix**: Configure schedules in Admin → Staff Management → Schedules

### Issue 3: Services Not Filtered by Stylist
**Symptoms**: All services show even if stylist doesn't offer them

**Check**: 
1. Verify staffMembers have availableServices array populated
2. Check ServicesManagement initialized default services
3. Verify filtering logic in BookingPage.tsx line ~159-175

### Issue 4: "Any Stylist" Shows But Individual Stylists Don't
**Symptoms**: Stylist dropdown only shows "Any Available"

**Root Cause**: staffMembers KV not initialized or all staff have isAdmin: true

**Fix**: Check StaffManagement.tsx default initialization line 34-38

---

## Data Verification Commands

### Check KV Storage Contents
Add these temporarily to App.tsx to debug:

```typescript
useEffect(() => {
  async function debugKV() {
    const keys = await spark.kv.keys()
    console.log('All KV keys:', keys)
    
    const appointments = await spark.kv.get('appointments')
    console.log('Appointments:', appointments)
    
    const customers = await spark.kv.get('customer-accounts')
    console.log('Customer accounts:', customers)
    
    const staff = await spark.kv.get('staff-members')
    console.log('Staff members:', staff)
    
    const services = await spark.kv.get('salon-services')
    console.log('Services:', services)
    
    const schedules = await spark.kv.get('staff-schedules')
    console.log('Schedules:', schedules)
  }
  debugKV()
}, [])
```

---

## Critical Pre-Flight Checklist

Before declaring "everything works":

- [ ] At least 2 staff members exist (not counting admin)
- [ ] All staff members have working schedules configured
- [ ] All staff members have services assigned to them
- [ ] At least 10 services exist in the system
- [ ] Default services match those on landing page
- [ ] Can create new customer account via booking
- [ ] Can login to existing customer account
- [ ] Customer can see their appointments after booking
- [ ] Staff can see assigned appointments in their dashboard
- [ ] Admin can see all appointments
- [ ] Service duration changes don't break existing appointments
- [ ] Appointment cancellation removes from customer view
- [ ] WhatsApp notifications attempt to send (even if failing)
- [ ] Can reschedule appointments
- [ ] Can book multiple services in one appointment

---

## Quick Smoke Test (5 minutes)

1. **Book appointment as new customer** → Should appear in customer profile after login
2. **Login as staff** → Should see the appointment with full details
3. **Login as admin** → Change a service duration → Book that service → Duration should reflect change
4. **Cancel the appointment** → Should disappear from all views

If all 4 steps work, core functionality is solid. ✅

---

## Emergency Reset

If data gets corrupted during testing:

```typescript
// In browser console:
await spark.kv.delete('appointments')
await spark.kv.delete('customer-accounts')
await spark.kv.delete('staff-schedules')
await spark.kv.delete('salon-services')
// Refresh page - will reinitialize with defaults
```
