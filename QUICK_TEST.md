# 🚀 Quick WhatsApp Test

## Test WhatsApp Notifications in 3 Steps

### Step 1: Join Twilio Sandbox (One-time setup)
Open WhatsApp and send this message:
```
To: +1 415 523 8886
Message: join [your-sandbox-code]
```
*Check your Twilio console for your specific sandbox code*

### Step 2: Book a Test Appointment
1. Click **"Book Appointment"** button on the website
2. Fill out the form with test data:
   - **Name**: Test User
   - **Email**: test@example.com  
   - **Phone**: Your 10-digit Mexico number (e.g., `8124028082`)
   - **Service**: Any service
   - **Date**: Tomorrow or any future date
   - **Time**: Any available time slot
3. Click **"Request Appointment"**

### Step 3: Verify Messages Received
Check your WhatsApp for **2 messages**:

**Immediate confirmation:**
> Hi Test User! Your appointment for [Service] on [Date] at [Time] with [Stylist] has been confirmed. We look forward to seeing you! - Ocho Hair Lab

**8-hour reminder** (sent 8 hours before appointment):
> Hi Test User! Reminder: You have a [Service] appointment in 8 hours ([Date]) at [Time] with [Stylist]. We look forward to seeing you! - Ocho Hair Lab

---

## ✅ What Gets Tested

- [x] Immediate WhatsApp confirmation to customer
- [x] Booking notification to salon (+52 81 1615 3747)
- [x] Mexico phone number formatting (+52 prefix)
- [x] 8-hour appointment reminder scheduling
- [x] Twilio API integration
- [x] Data persistence (view in Customer Profile)

---

## 🐛 Troubleshooting

**No WhatsApp received?**
- Did you join the sandbox first?
- Is your phone number correct?
- Check browser console (F12) for errors

**Can't select time slots?**
- Select a date first
- Try "Any Available" stylist
- Some dates may be blocked

---

**For detailed testing guide, see:** `WHATSAPP_TEST_GUIDE.md`
