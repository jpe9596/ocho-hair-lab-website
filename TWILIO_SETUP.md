# Twilio SMS Integration Setup Guide

## Overview
This application includes SMS notification functionality for appointment bookings using Twilio. Currently, the implementation uses a simulated version for development purposes. Follow this guide to integrate with actual Twilio services.

## What's Currently Implemented

The booking system now sends SMS notifications to:
1. **The customer** - Confirming their appointment request
2. **The salon** (81 1615 3747) - Notifying staff of new bookings

### Features
- SMS sent immediately when appointment is booked
- Customer receives confirmation with appointment details
- Salon staff receives booking notification with customer info
- Toast notifications confirm SMS delivery

## Twilio Setup Instructions

### Step 1: Create a Twilio Account
1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Sign up for a free trial or paid account
3. Verify your phone number

### Step 2: Get Your Twilio Credentials
You'll need three pieces of information from your Twilio dashboard:

1. **Account SID** - Found on your Twilio Console Dashboard
2. **Auth Token** - Found on your Twilio Console Dashboard (click "Show" to reveal)
3. **Twilio Phone Number** - Purchase a phone number from Twilio's Phone Numbers section
   - Recommended: Get a Mexican phone number for local SMS delivery
   - Make sure the number supports SMS capabilities

### Step 3: Configure the Application

Open `/src/lib/notifications.ts` and replace the placeholder values:

```typescript
// REPLACE THESE VALUES:
const twilioData = {
  to,
  message,
  from: 'YOUR_TWILIO_PHONE_NUMBER',  // e.g., '+525512345678'
  accountSid: 'YOUR_ACCOUNT_SID',     // e.g., 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  authToken: 'YOUR_AUTH_TOKEN'        // e.g., 'your_auth_token_here'
}
```

### Step 4: Replace Simulation with Real API Calls

To integrate with the actual Twilio API, you would typically need a backend service since API credentials shouldn't be exposed in browser code. Here are two options:

#### Option A: Backend Service (Recommended for Production)
Create a server endpoint that:
1. Receives appointment data from the frontend
2. Calls Twilio's API server-side (keeping credentials secure)
3. Returns success/failure to frontend

#### Option B: Twilio Functions (Serverless)
Use Twilio Functions to create a serverless endpoint:
1. Go to Twilio Console → Functions & Assets → Services
2. Create a new Service
3. Add a function that sends SMS
4. Call this function from your frontend

### Step 5: Test Your Integration

**During Twilio Trial:**
- You can only send SMS to verified phone numbers
- Add test phone numbers in Twilio Console → Phone Numbers → Verified Caller IDs

**After Upgrading:**
- You can send to any phone number
- Monitor usage in Twilio Console → Monitor → Logs

## Message Templates

### Customer Notification
```
Hi {Name}! Your appointment request for {Service} on {Date} at {Time} has been received. We'll confirm within 24 hours. - Ocho Hair Lab
```

### Salon Notification
```
New appointment request:
Name: {Name}
Service: {Service}
Date: {Date}
Time: {Time}
Phone: {Phone}
```

## Cost Considerations

- **Mexico SMS costs**: Approximately $0.0400 USD per SMS segment
- Each booking sends 2 SMS (customer + salon) = ~$0.08 USD per booking
- Twilio trial includes free credits to test

## Security Best Practices

⚠️ **IMPORTANT**: Never commit actual Twilio credentials to version control!

For production:
1. Use environment variables for credentials
2. Implement a backend service to handle SMS
3. Add rate limiting to prevent abuse
4. Validate phone numbers before sending

## Troubleshooting

### SMS Not Sending
- Check that phone numbers include country code (e.g., +52 for Mexico)
- Verify Twilio credentials are correct
- Check Twilio Console → Monitor → Logs for error details
- Ensure sufficient Twilio account balance

### International SMS Issues
- Some countries have restrictions on SMS
- Verify the destination country allows SMS from Twilio
- Consider using Twilio's Messaging Services for better deliverability

## Support

- Twilio Documentation: [https://www.twilio.com/docs](https://www.twilio.com/docs)
- Twilio Support: Available through Twilio Console
- SMS API Reference: [https://www.twilio.com/docs/sms](https://www.twilio.com/docs/sms)

## Current Status

✅ SMS notification structure implemented  
✅ Customer and salon notifications configured  
✅ Phone number validation in booking form  
🔄 Using simulated SMS (replace with real Twilio API)  
⏳ Pending: Backend service for secure credential management
