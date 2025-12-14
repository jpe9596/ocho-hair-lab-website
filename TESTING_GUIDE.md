# 📱 WhatsApp Notifications - Testing Instructions

## Overview

The Ocho Hair Lab website is fully integrated with **Twilio WhatsApp API** to send automated notifications when customers book appointments. This document provides step-by-step instructions for testing this functionality.

---

## 🎯 What Happens When You Book an Appointment?

### 1. **Immediate Confirmation** (sent within seconds)
- ✅ Customer receives WhatsApp confirmation with appointment details
- ✅ Salon receives notification about the new booking

### 2. **8-Hour Reminder** (sent automatically)
- ✅ Customer receives reminder 8 hours before appointment
- ✅ Salon receives notification that reminder was sent

---

## 🚀 Quick Test (3 Steps)

### **Step 1: Join Twilio Sandbox** ⚠️ *Required First Time Only*

Before you can receive WhatsApp messages, you must join the Twilio sandbox:

1. Open **WhatsApp** on your phone
2. Create a new message to: **+1 415 523 8886**
3. Send this message: `join [your-sandbox-code]`
   - Replace `[your-sandbox-code]` with your actual code from Twilio console
   - Example: `join entire-donkey` or `join happy-elephant`
4. Wait for confirmation from Twilio

**How to find your sandbox code:**
- Log into [Twilio Console](https://console.twilio.com/)
- Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
- Your sandbox code is shown on that page

---

### **Step 2: Book a Test Appointment**

1. **Open the Ocho Hair Lab website**

2. **Click "Book Appointment"** button
   - Found in navigation bar or hero section

3. **Fill out the booking form:**

   | Field | Example Value |
   |-------|---------------|
   | **Full Name** | Test User |
   | **Email** | test@example.com |
   | **Phone Number** | 8124028082 *(your 10-digit Mexico number)* |
   | **Service** | Color Services *(or any service)* |
   | **Preferred Stylist** | Any Available *(or choose specific stylist)* |
   | **Preferred Date** | Tomorrow *(or any future date)* |
   | **Preferred Time** | Any available time slot |
   | **Additional Notes** | Test booking *(optional)* |

4. **Click "Request Appointment"**

5. **Wait for success message:**
   ```
   ✓ Appointment Confirmed!
   Confirmation sent via WhatsApp immediately. 
   You'll also receive a reminder 8 hours before...
   ```

---

### **Step 3: Verify WhatsApp Messages**

**Check your WhatsApp** (should arrive within 5-10 seconds):

**Message 1 - Immediate Confirmation:**
```
Hi Test User! Your appointment for Color Services 
on Friday, January 10, 2025 at 2:00 PM with 
Maria Rodriguez has been confirmed. 
We look forward to seeing you! - Ocho Hair Lab
```

**Message 2 - 8-Hour Reminder** *(sent 8 hours before appointment)*:
```
Hi Test User! Reminder: You have a Color Services 
appointment in 8 hours (Friday, January 10, 2025) 
at 2:00 PM with Maria Rodriguez. 
We look forward to seeing you! - Ocho Hair Lab
```

**Salon Also Receives:**
- The salon's WhatsApp (+52 81 1615 3747) receives both messages
- Must also join the sandbox to receive messages

---

## ✅ Verification Checklist

After booking, verify these items:

- [ ] Success toast appears in the browser
- [ ] WhatsApp confirmation received on customer phone (within 10 seconds)
- [ ] Salon receives booking notification
- [ ] Appointment appears in Customer Profile (click "View" button in toast)
- [ ] No errors in browser console (press F12 → Console tab)
- [ ] Phone number formatted correctly: `+52XXXXXXXXXX`

---

## 🔍 Detailed Testing Scenarios

### Scenario 1: Test Immediate Notifications

**Goal:** Verify instant WhatsApp messages work

1. Book appointment for any future date/time
2. Check WhatsApp immediately (within 30 seconds)
3. Both customer and salon should receive confirmation

**Expected Result:**
- Customer gets booking confirmation
- Salon gets new booking alert
- Browser shows success message

---

### Scenario 2: Test 8-Hour Reminders

**Goal:** Verify scheduled reminders work

**Option A - Book Soon (Faster Testing):**
1. Book appointment for tomorrow at a specific time
2. Wait until 8 hours before that appointment time
3. System automatically checks hourly and sends reminders

**Option B - Check Existing Appointments:**
1. Go to Customer Profile (`#profile` in URL or click "View")
2. See all your booked appointments
3. Appointments within 8 hours will trigger reminders

**Expected Result:**
- Reminder sent 8 hours before appointment
- Both customer and salon receive reminder message

---

### Scenario 3: Test Multiple Appointments

**Goal:** Verify system handles multiple bookings

1. Book 2-3 different appointments
2. Each should send individual confirmations
3. Each will send individual reminders at the right time

**Expected Result:**
- Each booking gets its own confirmation
- Each reminder sends at correct time
- No conflicts between appointments

---

## 🐛 Troubleshooting

### Problem: "WhatsApp message not received"

**Solutions:**
1. ✅ **Join the sandbox first** - Send "join [code]" to +14155238886
2. ✅ **Check phone number format** - Should be 10 digits: `8124028082`
3. ✅ **Verify WhatsApp is installed** - Must have active WhatsApp on that number
4. ✅ **Check Twilio balance** - Account needs available credits
5. ✅ **Check browser console** - Look for error messages (F12 → Console)

---

### Problem: "Form won't submit"

**Solutions:**
1. ✅ **Fill all required fields** - Name, email, phone, service, date, time
2. ✅ **Select a valid date** - Must be future date, not Sunday
3. ✅ **Select available time** - Must choose from available time slots
4. ✅ **Check phone number** - 10 digits, numbers only

---

### Problem: "No available time slots"

**Solutions:**
1. ✅ **Try different stylist** - Some may be blocked on that date
2. ✅ **Select "Any Available"** - Shows all possible times
3. ✅ **Try different date** - Some dates may be blocked
4. ✅ **Avoid Sundays** - Salon is closed

---

### Problem: "Console shows Twilio error"

**Common Twilio Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| `21211` | Invalid "To" number | Join sandbox or check number format |
| `21608` | Number not WhatsApp-capable | Verify WhatsApp installed on that number |
| `20003` | Authentication error | Check auth token in config |
| `21606` | From number not verified | Using sandbox number correctly |

**How to check errors:**
1. Press **F12** to open browser console
2. Look under **Console** tab
3. Look for red error messages
4. Search error code on [Twilio docs](https://www.twilio.com/docs/api/errors)

---

## 📊 System Architecture

### Data Flow

```
Customer Books Appointment
        ↓
Form Validation
        ↓
Save to KV Storage
        ↓
Call sendBookingConfirmation()
        ↓
Twilio API (WhatsApp)
        ↓
    ┌───┴───┐
    ↓       ↓
Customer  Salon
WhatsApp  WhatsApp
```

### Reminder System

```
Hourly Check (useAppointmentReminders hook)
        ↓
Find appointments within 8 hours
        ↓
Check if reminder already sent
        ↓
If not sent → Send reminder
        ↓
Mark as reminderSent: true
```

---

## 🔐 Current Configuration

**Twilio Settings** (from `src/lib/twilio-config.ts`):

```typescript
Account SID:      ACe7262fb35ec470497df636e736ba3d1a
Auth Token:       340898d89e3226f78f1cf217f7c6717a
WhatsApp From:    whatsapp:+14155238886 (Twilio Sandbox)
Salon WhatsApp:   whatsapp:+5218116153747
Template ID:      HXb5b62575e6e4ff6129ad7c8efe1f983e
```

**Phone Number Format:**
- Input: `8124028082` (10 digits)
- Formatted: `+528124028082` (Mexico +52 added automatically)
- WhatsApp: `whatsapp:+528124028082` (final format)

---

## 📱 Testing from Different Devices

### Desktop Browser
1. Open website in Chrome/Firefox/Safari
2. Book appointment normally
3. Check WhatsApp on phone

### Mobile Browser
1. Open website on mobile browser
2. Book appointment
3. Switch to WhatsApp to see message
4. Return to browser for confirmation

### Tablet
1. Same as mobile
2. Responsive design adapts to screen size

---

## 🎓 Advanced Testing

### Test Console Logging

Open browser console (F12) to see detailed logs:

```javascript
// Successful message send:
"WhatsApp message sent via Twilio: {sid: 'SM...', status: 'queued'}"

// Error:
"Twilio API error: 21211"
"Failed to send WhatsApp message: Error: ..."
```

### Test Customer Profile Integration

1. Book appointment
2. Click "View" in success toast
3. Or navigate to `/#profile`
4. See all your appointments
5. Try rescheduling or canceling

### Test Staff Schedules

1. Different stylists have different availability
2. Some dates may be blocked
3. Time slots filtered by availability
4. "Any Available" shows all possible times

---

## 📚 Additional Resources

- **Quick Test Guide**: `QUICK_TEST.md` - 1-page quick reference
- **Detailed Setup Guide**: `TWILIO_SETUP.md` - Complete configuration docs
- **This Guide**: `WHATSAPP_TEST_GUIDE.md` - Full testing instructions

**Twilio Resources:**
- [Twilio Console](https://console.twilio.com/)
- [WhatsApp Sandbox](https://www.twilio.com/docs/whatsapp/sandbox)
- [API Errors](https://www.twilio.com/docs/api/errors)
- [Twilio Support](https://support.twilio.com/)

---

## ⚠️ Important Notes

### Security Warning

The current setup has the **auth token hardcoded** in the source code. This is **only for development/testing**.

**For production:**
1. Move credentials to environment variables
2. Use backend server for Twilio API calls
3. Never commit auth tokens to version control
4. Use Twilio's best practices for security

### Sandbox Limitations

Twilio sandbox has limitations:
- Recipients must join sandbox first
- Limited to approved templates
- Lower rate limits
- For testing only

**For production:**
- Apply for WhatsApp Business Account
- Get custom templates approved
- Use your own business number
- Remove sandbox restrictions

---

## 🎉 Success!

You've successfully tested WhatsApp notifications when:

✅ Form submits without errors  
✅ WhatsApp confirmation received within 10 seconds  
✅ Salon receives booking notification  
✅ Appointment appears in profile  
✅ Console shows successful API calls  
✅ 8-hour reminder scheduled and sent  

**Happy testing! 🎨💇‍♀️**

---

*Last updated: January 2025*
