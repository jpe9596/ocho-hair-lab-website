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
          WhatsApp Testing Status
          {isConfigured ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle size={16} weight="fill" className="mr-1" />
              Ready
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle size={16} weight="fill" className="mr-1" />
              Not Configured
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Current Twilio WhatsApp integration status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            label="Salon WhatsApp"
            value={TWILIO_CONFIG.salonWhatsApp}
            status={TWILIO_CONFIG.salonWhatsApp ? 'success' : 'error'}
          />
          <StatusItem
            label="Template ID"
            value={TWILIO_CONFIG.contentSid}
            status={TWILIO_CONFIG.contentSid ? 'success' : 'error'}
          />
        </div>

        <div className="pt-4 border-t space-y-2">
          <h4 className="font-semibold text-sm">Testing Checklist:</h4>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 flex-shrink-0" />
              <span>Join Twilio sandbox: Send "join [code]" to +1 415 523 8886</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 flex-shrink-0" />
              <span>Book a test appointment with your Mexico mobile number (10 digits)</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 flex-shrink-0" />
              <span>Numbers will be formatted to E.164: +521XXXXXXXXXX (Mexico mobile)</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 flex-shrink-0" />
              <span>Check WhatsApp for immediate confirmation message</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 flex-shrink-0" />
              <span>Verify 8-hour reminder is scheduled</span>
            </li>
          </ul>
        </div>

        {isConfigured && (
          <div className="pt-4 border-t">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ System is ready for testing! Book an appointment to test WhatsApp notifications.
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
