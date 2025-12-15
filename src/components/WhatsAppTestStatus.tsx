import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "@phosphor-icons/react"
import { TWILIO_CONFIG } from "@/lib/twilio-config"

export function WhatsAppTestStatus() {
  const isConfigured = TWILIO_CONFIG.authToken && TWILIO_CONFIG.authToken.length > 0
  const isTemplateConfigured = TWILIO_CONFIG.contentSid && TWILIO_CONFIG.contentSid.length > 0
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          WhatsApp Testing Status
          {isConfigured && isTemplateConfigured ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle size={16} weight="fill" className="mr-1" />
              Ready (Template Mode)
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle size={16} weight="fill" className="mr-1" />
              Not Configured
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Using ContentSid & ContentVariables (Required after April 1, 2025)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <CheckCircle size={20} weight="fill" className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                ✓ Updated to new WhatsApp API requirements
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                All messages now use ContentSid and ContentVariables instead of Body parameter. This ensures compliance with WhatsApp's requirements for business-initiated messages after April 1, 2025.
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
            label="Salon WhatsApp"
            value={TWILIO_CONFIG.salonWhatsApp}
            status={TWILIO_CONFIG.salonWhatsApp ? 'success' : 'error'}
          />
          <StatusItem
            label="Content SID (Template)"
            value={TWILIO_CONFIG.contentSid}
            status={isTemplateConfigured ? 'success' : 'error'}
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
              <span>Check WhatsApp for immediate confirmation using approved template</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 flex-shrink-0" />
              <span>Verify 8-hour reminder is scheduled and uses template format</span>
            </li>
          </ul>
        </div>

        {isConfigured && isTemplateConfigured && (
          <div className="pt-4 border-t">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ System is ready for testing! All messages use ContentSid: {TWILIO_CONFIG.contentSid}
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
