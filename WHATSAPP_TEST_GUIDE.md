# WhatsApp Notification Testing Guide 📱

This guide will walk you through testing the WhatsApp notification system by booking a test appointment.

## 🎯 What You'll Test

When you book an appointment, the system will send **TWO** WhatsApp messages:

1. **Immediate Confirmation** - Sent right when you book
2. **8-Hour Reminder** - Sent automatically 8 hours before your appointment time

Both messages go to:
- ✅ The customer's phone number
- ✅ The salon's WhatsApp (+52 81 1615 3747)

---

## 📋 Prerequisites

### Important: Twilio Sandbox Setup

Since you're using Twilio's sandbox mode, **you MUST join the sandbox first** before you can receive WhatsApp messages.

**To join the sandbox:**

1. Open WhatsApp on your phone
2. Send a message to: **+1 415 523 8886**
3. Message content: **join [your-sandbox-code]**
   - Check your Twilio console for your specific sandbox code
   - Example: `join entire-donkey` or `join happy-elephant`
4. Wait for the confirmation message from Twilio
5. You're now ready to receive WhatsApp messages!

---

## 🧪 Step-by-Step Testing Process

### Step 1: Open the Booking Dialog

1. Navigate to the Ocho Hair Lab website
2. Click the **"Book Appointment"** button in the navigation or hero section

### Step 2: Fill Out the Form

**Required Information:**

- **Full Name**: Enter any test name (e.g., "Test User")
- **Email**: Enter any email (e.g., test@example.com)
- **Phone Number**: Enter your Mexico phone number
  - Format: `81 2402 8082` or `8124028082`
  - The system will automatically add +52
  - Final format will be: `whatsapp:+528124028082`

- **Service**: Select any service from the dropdown
  - Examples: "Color Services", "Balayage & Highlights", etc.

- **Preferred Stylist**: Choose one or leave as "Any Available"
  - Maria Rodriguez
  - Jessica Chen
  - Alex Thompson
  - Sophia Martinez

- **Preferred Date**: Click a date on the calendar
  - ⚠️ Cannot select past dates
  - ⚠️ Cannot select Sundays (salon is closed)
  - ⚠️ Some dates may be blocked by staff schedules

- **Preferred Time**: Select a time slot
  - Times are filtered based on stylist availability
  - Only available slots will show up

- **Additional Notes**: (Optional) Add any special requests

### Step 3: Submit the Appointment

1. Click **"Request Appointment"** button
2. Wait for the confirmation toast notification
3. Check your browser console for sending logs (F12 → Console tab)

---

## ✅ Expected Results

### Immediate Response (Within Seconds)

**1. Success Toast Notification:**
```
✓ Appointment Confirmed!
Confirmation sent via WhatsApp immediately. 
You'll also receive a reminder 8 hours before your appointment on [Date] at [Time]!
```

**2. WhatsApp Message to Customer:**
```
Hi [Your Name]! Your appointment for [Service] on [Date] at [Time] 
with [Stylist] has been confirmed. We look forward to seeing you! 
- Ocho Hair Lab
```

**3. WhatsApp Message to Salon:**
```
New appointment booked:
Name: [Your Name]
Service: [Service]
Date: [Date]
Time: [Time]
Stylist: [Stylist]
Customer Phone: [Your Phone]
```

### 8 Hours Before Appointment

**4. Reminder WhatsApp to Customer:**
```
Hi [Your Name]! Reminder: You have a [Service] appointment in 8 hours 
([Date]) at [Time] with [Stylist]. We look forward to seeing you! 
- Ocho Hair Lab
```

**5. Reminder WhatsApp to Salon:**
```
8-hour reminder sent to [Your Name] for upcoming appointment:
Service: [Service]
Time: [Time]
Stylist: [Stylist]
Customer Phone: [Your Phone]
```

---

## 🔍 Verification Checklist

Use this checklist to verify everything works:

- [ ] Form submitted successfully without errors
- [ ] Success toast appears with correct appointment details
- [ ] Immediate WhatsApp confirmation received on customer phone
- [ ] Salon receives booking notification
- [ ] Appointment appears in Customer Profile (click "View" or go to #profile)
- [ ] Browser console shows successful API calls
- [ ] 8-hour reminder scheduled (check back 8 hours before appointment)

---

## 🐛 Troubleshooting

### "Messages Not Sending"

**Check browser console (F12 → Console):**
- Look for errors starting with "Twilio API error"
- Look for "Failed to send WhatsApp message"

**Common causes:**
- ❌ Haven't joined Twilio sandbox (send "join [code]" to +14155238886)
- ❌ Phone number format incorrect
- ❌ Twilio account out of credits
- ❌ Network/CORS issues

### "Invalid Phone Number" Error

- Make sure you've joined the Twilio sandbox first
- Try formatting as: `8124028082` (10 digits, no spaces)
- System will convert to: `+528124028082`

### "No Available Times" in Dropdown

- Some stylists may have blocked dates
- Try selecting a different stylist
- Try selecting "Any Available"
- Try a different date

### Messages to Salon Not Received

The salon WhatsApp (+52 81 1615 3747) also needs to:
1. Join the Twilio sandbox
2. Send "join [your-sandbox-code]" to +14155238886

---

## 📊 Testing Different Scenarios

### Test Case 1: Immediate Appointment (Less Than 8 Hours Away)

**Purpose**: Test if both messages send immediately

1. Book an appointment for today or tomorrow within 8 hours
2. You should receive:
   - Immediate confirmation
   - 8-hour reminder very soon (system checks hourly)

### Test Case 2: Future Appointment (More Than 8 Hours Away)

**Purpose**: Test scheduled reminders

1. Book an appointment several days in the future
2. You should receive:
   - Immediate confirmation now
   - 8-hour reminder when the time comes

### Test Case 3: Multiple Appointments

**Purpose**: Test system handles multiple bookings

1. Book 2-3 different appointments
2. Each should have its own confirmation
3. Each should trigger its own reminder at the right time

---

## 🔐 Security Note

⚠️ **Important**: The Twilio Auth Token is currently hardcoded in the application. For production:

1. Move credentials to environment variables
2. Use a backend server to handle Twilio API calls
3. Never expose auth tokens in client-side code

Current setup is for **development/testing only**.

---

## 📞 Current Configuration

```
Twilio Account SID: ACe7262fb35ec470497df636e736ba3d1a
Twilio Auth Token: 340898d89e3226f78f1cf217f7c6717a
Twilio WhatsApp (From): whatsapp:+14155238886
Salon WhatsApp (To): whatsapp:+5218116153747
WhatsApp Template: HXb5b62575e6e4ff6129ad7c8efe1f983e
```

---

## 🎉 Success Criteria

Your test is successful when:

1. ✅ Form submits without errors
2. ✅ You receive WhatsApp confirmation within 10 seconds
3. ✅ Salon receives booking notification
4. ✅ Appointment shows in your profile
5. ✅ Console shows successful Twilio API responses
6. ✅ 8-hour reminder is scheduled and sent (if appointment is soon)

---

## 📝 Quick Test Script

**For fastest testing:**

1. Join Twilio sandbox (one-time): Send "join [code]" to +14155238886
2. Open website → Click "Book Appointment"
3. Fill form:
   - Name: Test User
   - Email: test@test.com
   - Phone: 8124028082
   - Service: Color Services
   - Date: Tomorrow
   - Time: Any available
4. Submit
5. Check WhatsApp in 5-10 seconds
6. ✅ Done!

---

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify you've joined the Twilio sandbox
3. Confirm phone number format is correct
4. Check Twilio console: https://console.twilio.com/
5. Verify Twilio account has available credits
6. Review the TWILIO_SETUP.md file for additional context

---

**Happy Testing! 🎨💇‍♀️**
