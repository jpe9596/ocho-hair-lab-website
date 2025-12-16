import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "@phosphor-icons/react"
import { TWILIO_CONFIG } from "@/lib/twilio-config"

export function WhatsAppTestStatus() {
  const isConfigured = TWILIO_CONFIG.authToken && TWILIO_CONFIG.authToken.length > 0
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          SMS Testing Status
          {isConfigured ? (
            <Badge variant="default">
              <CheckCircle size={16} weight="fill" className="mr-1" />
              Ready (SMS Mode)
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle size={16} weight="fill" className="mr-1" />
              Not Configured
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Using Twilio SMS API for appointment reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <CheckCircle size={20} weight="fill" className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                ✓ Updated to use SMS instead of WhatsApp
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                All appointment confirmations and reminders now use SMS messages via Twilio's SMS API. This is more reliable and doesn't require WhatsApp template approvals.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <StatusItem
            label="Twilio Account"
            value={TWILIO_CONFIG.accountSid}
            status={TWILIO_CONFIG.accountSid ? 'success' : 'error'}
          />
          <StatusItem
            label="Auth Token"
            value={isConfigured ? '••••••••••••••••' : 'Not configured'}
            status={isConfigured ? 'success' : 'error'}
          />
          <StatusItem
            label="WhatsApp From Number"
            value={TWILIO_CONFIG.whatsappNumber}
            status={TWILIO_CONFIG.whatsappNumber ? 'success' : 'error'}
          />
          <StatusItem
            label="Salon Phone"
            value={TWILIO_CONFIG.salonPhone}
            status={TWILIO_CONFIG.salonPhone ? 'success' : 'error'}
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2">Testing Steps:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 flex-shrink-0" />
              <span>Book a test appointment with your Mexico mobile number (10 digits)</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 flex-shrink-0" />
              <span>Numbers will be formatted to E.164: whatsapp:+521XXXXXXXXXX (Mexico mobile)</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 flex-shrink-0" />
              <span>Check WhatsApp for immediate confirmation</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 flex-shrink-0" />
              <span>Verify 8-hour reminder is scheduled and sent via WhatsApp</span>
            </li>
          </ul>
        </div>

        {isConfigured && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ System is ready for testing! WhatsApp messages will be sent from {TWILIO_CONFIG.whatsappNumber}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatusItem({ 
  label, 
  value, 
  status 
}: { 
  label: string
  value: string
  status: 'success' | 'error' | 'pending'
}) {
  const Icon = status === 'success' ? CheckCircle : status === 'error' ? XCircle : Clock
  const iconColor = status === 'success' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-yellow-500'
  
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground font-mono">{value}</span>
        <Icon size={16} weight="fill" className={iconColor} />
      </div>
    </div>
  )
}
