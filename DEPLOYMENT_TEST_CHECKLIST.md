# 🚀 Deployment Test Checklist for Ubuntu 24.02 VM

## Pre-Deployment Verification
Test all functionality before deploying to production VM.

---

## ✅ Critical User Flow Tests

### 1. New Customer Signup & Booking (PRIMARY TEST)
**This is the most important test - customers must be able to book appointments!**

#### Steps:
1. **Navigate to Home Page**
   - [ ] Page loads without errors
   - [ ] Navigation menu is visible and functional
   - [ ] All sections load (Hero, Products, Services, Contact)

2. **Start Booking Process**
   - [ ] Click "Book Appointment" button (Hero section or navigation)
   - [ ] Booking page opens at `#booking`
   - [ ] Form displays correctly with all fields

3. **Fill Out Booking Form**
   - [ ] **Name**: Enter test name (e.g., "Test Customer")
   - [ ] **Email**: Enter valid email (e.g., "test@example.com")
   - [ ] **Phone**: Enter 10-digit Mexico number (e.g., "8124028082")
   - [ ] **Password**: Create 6+ character password (e.g., "test123")
   - [ ] **Select Date**: Click calendar, choose future date
   - [ ] **Select Services**: Check at least one service checkbox
   - [ ] **Select Stylist**: Choose stylist or "Any Available"
   - [ ] **Select Time**: Choose from available time slots
   - [ ] **Notes**: Optional - add any notes

4. **Submit Appointment**
   - [ ] Click "Book Appointment" button
   - [ ] Success toast notification appears
   - [ ] Redirects to Customer Login page after 2 seconds
   - [ ] Form auto-fills with booking credentials

5. **Automatic Login**
   - [ ] Login page shows pre-filled email and password
   - [ ] Auto-login occurs within 1 second
   - [ ] Welcome message shows with customer name
   - [ ] Redirects to Customer Profile page

6. **Verify Appointment in Profile**
   - [ ] Profile page loads successfully
   - [ ] Customer name and email displayed correctly
   - [ ] Appointment appears in "Upcoming Appointments" section
   - [ ] Appointment shows correct:
     - Date and time
     - Service(s) selected
     - Stylist assigned
     - Status: "Confirmed"
   - [ ] "Cancel Appointment" button is available

---

### 2. Returning Customer Login & Booking

#### Steps:
1. **Navigate to Customer Login**
   - [ ] Click profile icon or navigate to `#customer-login`
   - [ ] Login form displays

2. **Login with Existing Account**
   - [ ] Enter email from previous test
   - [ ] Enter password from previous test
   - [ ] Click "Login" button
   - [ ] Success message shows
   - [ ] Redirects to Customer Profile

3. **Book Another Appointment**
   - [ ] From profile page, click "Book New Appointment" or similar
   - [ ] Form pre-fills with customer information
   - [ ] Select different date/time/service
   - [ ] Submit booking
   - [ ] New appointment appears in profile
   - [ ] Both appointments visible in list

---

### 3. Appointment Cancellation

#### Steps:
1. **Cancel from Profile**
   - [ ] Navigate to Customer Profile (logged in)
   - [ ] Click "Cancel" on an upcoming appointment
   - [ ] Confirmation dialog appears
   - [ ] Confirm cancellation
   - [ ] Appointment status changes to "Cancelled"
   - [ ] Toast notification confirms cancellation

2. **Cancel via Direct Link**
   - [ ] Use cancel link format: `#cancel-[appointment-id]`
   - [ ] Cancel page loads
   - [ ] Shows appointment details
   - [ ] Click confirm cancellation
   - [ ] Success message appears

---

### 4. WhatsApp Notifications (IMPORTANT)

**Before testing, ensure Twilio is configured:**
- [ ] TWILIO_ACCOUNT_SID set in environment
- [ ] TWILIO_AUTH_TOKEN set in environment
- [ ] TWILIO_WHATSAPP_FROM set (e.g., "whatsapp:+14155238886")
- [ ] Your phone joined Twilio sandbox (send "join [code]" to +1 415 523 8886)

#### Test Booking Confirmation:
1. **Book Test Appointment**
   - [ ] Use your real WhatsApp number
   - [ ] Complete booking as described in Test #1
   
2. **Verify WhatsApp Messages**
   - [ ] **Customer receives**: Booking confirmation with details
   - [ ] **Salon receives**: New booking notification to +52 81 1615 3747
   - [ ] Messages include: Name, Service, Date, Time, Stylist
   - [ ] Messages include cancellation link

3. **Test 8-Hour Reminder** (Optional - requires waiting)
   - [ ] Book appointment 8-9 hours in future
   - [ ] Wait for 8-hour mark before appointment
   - [ ] Verify reminder WhatsApp message sent
   - [ ] Message includes all appointment details

---

### 5. Navigation & Pages

#### Home Page Navigation:
- [ ] Click "Services" - scrolls to Services section
- [ ] Click "Products" - scrolls to Products section
- [ ] Click "Contact" - scrolls to Contact section
- [ ] Click logo - returns to top
- [ ] All scroll animations smooth
- [ ] Navigation remains accessible on mobile

#### Page Routing:
- [ ] `#home` or `/` - Shows landing page
- [ ] `#booking` - Shows booking form
- [ ] `#profile` - Shows customer profile (when logged in)
- [ ] `#customer-login` - Shows login page
- [ ] `#admin` - Shows admin dashboard (requires admin login)
- [ ] `#staff` - Shows staff login/dashboard
- [ ] `#cancel-[id]` - Shows cancellation page

---

### 6. Visual & Content Verification

#### Hero Section:
- [ ] Hero image/video loads
- [ ] Main heading visible
- [ ] Tagline/description clear
- [ ] "Book Appointment" CTA prominent and clickable

#### Products Section:
- [ ] Product image displays (natural.png)
- [ ] Product descriptions readable
- [ ] Layout responsive on mobile

#### Services Section:
- [ ] All services listed
- [ ] Prices displayed
- [ ] Durations shown
- [ ] Cards/layout organized clearly

#### Contact Section:
- [ ] **Contact image shows Alejandro** (alejandro.png)
- [ ] Phone number clickable: (81) 1615-3747
- [ ] Address displayed correctly:
  - Urbox Plaza
  - Río Hudson 414, Del Valle
  - 66220 San Pedro Garza García, N.L.
- [ ] Instagram link works
- [ ] Instagram icon displays

#### Footer:
- [ ] Footer information visible
- [ ] Links functional
- [ ] Copyright/branding present

---

### 7. Responsive Design Tests

#### Mobile (viewport < 768px):
- [ ] Navigation collapses to hamburger menu
- [ ] All sections stack vertically
- [ ] Images scale appropriately
- [ ] Forms remain usable
- [ ] Buttons are tap-friendly (44px+ touch targets)
- [ ] Text remains readable

#### Tablet (768px - 1024px):
- [ ] Layout adjusts appropriately
- [ ] Images maintain aspect ratios
- [ ] Two-column layouts where appropriate

#### Desktop (1024px+):
- [ ] Full layout displays
- [ ] Max-width containers center content
- [ ] Images display at optimal resolution

---

### 8. Form Validation

#### Booking Form:
- [ ] Name required - shows error if empty
- [ ] Email required - validates email format
- [ ] Phone required - validates number format
- [ ] Password required - minimum 6 characters
- [ ] Date required - won't submit without date
- [ ] Service required - at least one must be selected
- [ ] Time required - must select available time slot
- [ ] Invalid inputs show clear error messages
- [ ] Valid submission proceeds successfully

#### Login Form:
- [ ] Email required
- [ ] Password required
- [ ] Invalid credentials show error
- [ ] Valid credentials proceed to profile

---

### 9. Data Persistence Tests

#### Browser Refresh:
- [ ] Book appointment
- [ ] Close browser tab
- [ ] Reopen site
- [ ] Navigate to profile (after login)
- [ ] Appointment still exists

#### Multiple Sessions:
- [ ] Book appointment in Browser A
- [ ] Open site in Browser B (different session)
- [ ] Login with same account
- [ ] Verify appointment shows in both browsers

---

### 10. Error Handling

#### Network Errors:
- [ ] Disconnect network
- [ ] Try to submit booking
- [ ] Error message displays gracefully
- [ ] Reconnect network
- [ ] Retry submission works

#### Invalid Data:
- [ ] Enter past date - should block or warn
- [ ] Enter invalid phone format - should validate
- [ ] Enter duplicate appointment time - should handle
- [ ] All errors show user-friendly messages

---

## 🐛 Common Issues & Fixes

### Issue: "Time slots not appearing"
**Fix**: 
- Ensure staff schedules are configured in Admin panel
- Select "Any Available" stylist
- Try different dates

### Issue: "WhatsApp not received"
**Fix**:
- Verify Twilio credentials in environment variables
- Confirm phone joined Twilio sandbox
- Check browser console (F12) for API errors
- Verify phone number format (10 digits for Mexico)

### Issue: "Can't login after booking"
**Fix**:
- Check that email/password match exactly
- Verify customer account was created
- Try manual login via `#customer-login`

### Issue: "Profile shows no appointments"
**Fix**:
- Verify email used for booking matches login email
- Check browser console for KV sync errors
- Wait 1-2 seconds after booking for KV to persist

---

## 📊 Performance Checks

- [ ] **Page Load**: < 3 seconds on 3G connection
- [ ] **Time to Interactive**: < 5 seconds
- [ ] **Images**: Optimized, lazy-loaded where appropriate
- [ ] **No console errors**: Open DevTools (F12), check Console tab
- [ ] **No console warnings**: Address any React/Vite warnings

---

## 🔒 Security Checks

- [ ] Passwords not visible in console logs
- [ ] Customer data not exposed in URLs
- [ ] Admin access requires authentication
- [ ] Staff access requires authentication
- [ ] No sensitive data in localStorage (uses KV)

---

## ✨ Final Checklist Before VM Deployment

- [ ] All 10 main tests passed
- [ ] WhatsApp notifications working
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Contact section shows Alejandro image
- [ ] All functionality tested on:
  - [ ] Chrome/Edge
  - [ ] Firefox
  - [ ] Safari (if available)
  - [ ] Mobile browser

---

## 🚀 Deployment to Ubuntu 24.02 VM

### Prerequisites on VM:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20+ and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v20+
npm --version   # Should be v10+
```

### Deploy Application:
```bash
# Clone/copy project to VM
cd /path/to/spark-template

# Install dependencies
npm install

# Set environment variables
export TWILIO_ACCOUNT_SID="your_account_sid"
export TWILIO_AUTH_TOKEN="your_auth_token"
export TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"

# Build for production
npm run build

# Serve with a process manager (PM2 recommended)
npm install -g pm2
pm2 start npm --name "ocho-hair-lab" -- run preview
pm2 save
pm2 startup
```

### Verify Deployment:
- [ ] Site accessible at VM IP/domain
- [ ] All tests from checklist pass on VM
- [ ] WhatsApp notifications working from VM
- [ ] SSL/HTTPS configured (if production)

---

## 📞 Support

**Issues during deployment?**
- Check `/var/log/` for system errors
- Check PM2 logs: `pm2 logs ocho-hair-lab`
- Verify Node.js version: `node --version`
- Check firewall: `sudo ufw status`
- Ensure port 3000/4173 open

**Need help?**
- Review: `COMPREHENSIVE_TEST_PLAN.md`
- Review: `WHATSAPP_TEST_GUIDE.md`
- Review: `ADMIN_LOGIN_GUIDE.md`
- Check browser console for errors (F12)

---

**Last Updated**: January 2026
**Contact**: Ocho Hair Lab Team
