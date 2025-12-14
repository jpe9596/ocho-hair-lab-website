# Twilio WhatsApp Integration Setup ✅

This application uses Twilio's WhatsApp API to send appointment notifications to customers.

## Configuration Status: COMPLETE ✅

All Twilio settings are configured in `/src/lib/twilio-config.ts`:

```typescript
export const TWILIO_CONFIG = {
  accountSid: 'ACe7262fb35ec470497df636e736ba3d1a',
  authToken: '340898d89e3226f78f1cf217f7c6717a',  // ✅ CONFIGURED
  whatsappNumber: 'whatsapp:+14155238886',          // Twilio sandbox number
  salonWhatsApp: 'whatsapp:+5218116153747',         // Salon's WhatsApp number
  contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e'  // Template ID
}
```

## Current Setup

### ✅ Auth Token Configured

Your Twilio auth token is now properly configured and matches your sandbox credentials



### ✅ Mexico Phone Number Support

The system automatically adds the +52 Mexico country code to phone numbers. Customers can enter their number in any of these formats:
- `8124028082` (10 digits) → automatically becomes `+528124028082`
- `528124028082` → becomes `+528124028082`
- `+528124028082` → stays as is

### Phone Number Format

When customers book appointments, they should enter their phone number in international format without the "whatsapp:" prefix:

**Examples:**
- ✅ `+5218124028082` (Mexico)
- ✅ `+12125551234` (USA)
- ❌ `whatsapp:+5218124028082` (will be added automatically)

The system will automatically format the number with the "whatsapp:" prefix when sending messages.

### ✅ WhatsApp Template Configured

The system includes support for Twilio's pre-approved WhatsApp templates:

- **Content SID:** `HXb5b62575e6e4ff6129ad7c8efe1f983e`
- **Variables:** 
  - Variable 1: Date (e.g., "12/1")
  - Variable 2: Time (e.g., "3pm")

The template function is available in `/src/lib/twilio-config.ts` as `sendWhatsAppTemplate()` if you want to use it instead of plain text messages.

## How It Works

### Booking Confirmations ✅
When a customer books an appointment, the system **immediately** sends:
1. **To Customer:** Confirmation message with appointment details
2. **To Salon:** Notification about the new booking at `whatsapp:+5218116153747`

### Appointment Reminders ✅
The system automatically checks for upcoming appointments every hour and sends:
- **8-hour reminder:** Sent automatically when an appointment is within 8 hours
- **Immediate confirmation:** Sent right when the booking is made
- Messages are sent to both the customer and the salon

### Reschedule Notifications ✅
When a customer reschedules:
1. **To Customer:** Confirmation of the new date/time
2. **To Salon:** Notification about the reschedule

## Testing

### Test in Development
1. Book a test appointment through the website
2. Check the browser console for message sending logs
3. Verify WhatsApp messages are received

### Common Issues

**Problem:** Messages not sending
- ✅ Verify auth token is correct
- ✅ Check that phone numbers are in correct format (+country code + number)
- ✅ Ensure Twilio account has sufficient balance
- ✅ Check browser console for error messages

**Problem:** "Not a valid WhatsApp capable number"
- ✅ The recipient must have WhatsApp installed and active
- ✅ In sandbox mode, recipients must join the sandbox first
- ✅ Send "join [your-sandbox-keyword]" to +14155238886 from WhatsApp

## Production Deployment

For production use with your own WhatsApp Business number:

1. Apply for a WhatsApp Business account through Twilio
2. Update `whatsappNumber` in config with your approved number
3. Get your templates approved by WhatsApp
4. Replace sandbox number with your production number

## Security Notes

⚠️ **Important:** Never commit your auth token to version control!

Consider using environment variables or a secure configuration management system for production deployments.

## Support

For Twilio-specific issues:
- Twilio Console: https://console.twilio.com/
- Twilio Support: https://support.twilio.com/
- WhatsApp Sandbox: https://www.twilio.com/docs/whatsapp/sandbox
