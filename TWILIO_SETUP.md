# Twilio WhatsApp Integration Setup

This application uses Twilio's WhatsApp API to send appointment notifications to customers.

## Configuration

All Twilio settings are located in `/src/lib/twilio-config.ts`:

```typescript
export const TWILIO_CONFIG = {
  accountSid: 'ACe7262fb35ec470497df636e736ba3d1a',
  authToken: 'YOUR_AUTH_TOKEN',              // ⚠️ REPLACE WITH YOUR AUTH TOKEN
  whatsappNumber: 'whatsapp:+14155238886',    // Twilio sandbox number
  salonWhatsApp: 'whatsapp:+5218116153747',   // Salon's WhatsApp number
  contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e'
}
```

## Required Steps

### 1. Add Your Twilio Auth Token

Replace `'YOUR_AUTH_TOKEN'` in `/src/lib/twilio-config.ts` with your actual Twilio auth token.

**To find your auth token:**
1. Log in to your Twilio Console: https://console.twilio.com/
2. Navigate to Account → API keys & tokens
3. Copy your Auth Token
4. Paste it in the configuration file

### 2. Phone Number Format

When customers book appointments, they should enter their phone number in international format without the "whatsapp:" prefix:

**Examples:**
- ✅ `+5218124028082` (Mexico)
- ✅ `+12125551234` (USA)
- ❌ `whatsapp:+5218124028082` (will be added automatically)

The system will automatically format the number with the "whatsapp:" prefix when sending messages.

### 3. WhatsApp Template (Optional)

The system includes support for Twilio's pre-approved WhatsApp templates. Your current template:

- **Content SID:** `HXb5b62575e6e4ff6129ad7c8efe1f983e`
- **Variables:** 
  - Variable 1: Date (e.g., "12/1")
  - Variable 2: Time (e.g., "3pm")

To use templates instead of plain text messages, you can modify the functions in the notification files.

## How It Works

### Booking Confirmations
When a customer books an appointment, the system sends:
1. **To Customer:** Confirmation message with appointment details
2. **To Salon:** Notification about the new booking

### Appointment Reminders
The system automatically checks for upcoming appointments and sends:
- **8-hour reminder:** Sent automatically when an appointment is within 8 hours
- Messages are sent to both the customer and the salon

### Reschedule Notifications
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
