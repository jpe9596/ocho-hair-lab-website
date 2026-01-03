import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useKV } from "@/hooks/spark-compat"
import { Copy, ArrowCounterClockwise } from "@phosphor-icons/react"
import { SMS_TEMPLATES, getServiceCategory } from "@/lib/sms-templates"

type MessageType = 'confirmation' | 'reminder' | 'reschedule' | 'cancellation'
type ServiceCategory = 'tinte' | 'corte' | 'bespoke' | 'tratamiento' | 'default'

interface CustomTemplates {
  confirmation?: Partial<Record<ServiceCategory, string>>
  reminder?: Partial<Record<ServiceCategory, string>>
  reschedule?: Partial<Record<ServiceCategory, string>>
  cancellation?: Partial<Record<ServiceCategory, string>>
}

export function SMSTemplateManager() {
  const [customTemplates, setCustomTemplates] = useKV<CustomTemplates>('sms-custom-templates', {})
  const [activeMessageType, setActiveMessageType] = useState<MessageType>('confirmation')
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('tinte')
  const [editedTemplate, setEditedTemplate] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  const getCurrentTemplate = () => {
    const customTemplate = customTemplates?.[activeMessageType]?.[activeCategory]
    if (customTemplate) return customTemplate
    
    const defaultTemplate = SMS_TEMPLATES[activeMessageType][activeCategory]
    return defaultTemplate({
      customerName: '{CUSTOMER_NAME}',
      service: '{SERVICE}',
      date: '{DATE}',
      time: '{TIME}',
      stylist: '{STYLIST}',
      oldDate: '{OLD_DATE}',
      oldTime: '{OLD_TIME}',
      newDate: '{NEW_DATE}',
      newTime: '{NEW_TIME}'
    })
  }

  const handleSaveTemplate = () => {
    setCustomTemplates((current) => ({
      ...current,
      [activeMessageType]: {
        ...current?.[activeMessageType],
        [activeCategory]: editedTemplate
      }
    }))
    toast.success('Template saved successfully')
    setEditedTemplate('')
    setShowPreview(false)
  }

  const handleResetTemplate = () => {
    setCustomTemplates((current) => {
      const updated = { ...current }
      if (updated[activeMessageType]) {
        delete updated[activeMessageType]![activeCategory]
      }
      return updated
    })
    toast.success('Template reset to default')
    setEditedTemplate('')
  }

  const handleCopyTemplate = () => {
    const template = getCurrentTemplate()
    navigator.clipboard.writeText(template)
    toast.success('Template copied to clipboard')
  }

  const getPreviewMessage = () => {
    const template = editedTemplate || getCurrentTemplate()
    return template
      .replace(/{CUSTOMER_NAME}/g, 'María García')
      .replace(/{SERVICE}/g, 'Balayage')
      .replace(/{DATE}/g, 'viernes, 15 de marzo de 2024')
      .replace(/{TIME}/g, '2:00 PM')
      .replace(/{STYLIST}/g, 'Ana López')
      .replace(/{OLD_DATE}/g, 'jueves, 14 de marzo de 2024')
      .replace(/{OLD_TIME}/g, '10:00 AM')
      .replace(/{NEW_DATE}/g, 'viernes, 15 de marzo de 2024')
      .replace(/{NEW_TIME}/g, '2:00 PM')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Template Manager</CardTitle>
        <CardDescription>
          Customize SMS messages for different appointment types. Use placeholders like {"{CUSTOMER_NAME}"}, {"{SERVICE}"}, {"{DATE}"}, {"{TIME}"}, and {"{STYLIST}"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeMessageType} onValueChange={(v) => setActiveMessageType(v as MessageType)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="confirmation">Confirmation</TabsTrigger>
            <TabsTrigger value="reminder">Reminder</TabsTrigger>
            <TabsTrigger value="reschedule">Reschedule</TabsTrigger>
            <TabsTrigger value="cancellation">Cancellation</TabsTrigger>
          </TabsList>

          <TabsContent value={activeMessageType} className="space-y-4 mt-6">
            <div className="flex gap-2 flex-wrap">
              {(['tinte', 'corte', 'bespoke', 'tratamiento', 'default'] as ServiceCategory[]).map((category) => (
                <Badge
                  key={category}
                  variant={activeCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setActiveCategory(category)
                    setEditedTemplate('')
                    setShowPreview(false)
                  }}
                >
                  {category === 'tinte' ? 'Tinte' : 
                   category === 'corte' ? 'Corte & Styling' : 
                   category === 'bespoke' ? 'Bespoke Color' : 
                   category === 'tratamiento' ? 'Tratamiento' : 
                   'Default'}
                </Badge>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Current Template</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyTemplate}
                    >
                      <Copy size={16} className="mr-2" />
                      Copy
                    </Button>
                    {customTemplates?.[activeMessageType]?.[activeCategory] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetTemplate}
                      >
                        <ArrowCounterClockwise size={16} className="mr-2" />
                        Reset to Default
                      </Button>
                    )}
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                  {getCurrentTemplate()}
                </div>
                {customTemplates?.[activeMessageType]?.[activeCategory] && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ✓ Using custom template
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-template">Edit Template</Label>
                <Textarea
                  id="edit-template"
                  value={editedTemplate}
                  onChange={(e) => setEditedTemplate(e.target.value)}
                  placeholder={getCurrentTemplate()}
                  rows={8}
                  className="font-mono text-sm mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Available placeholders: {"{CUSTOMER_NAME}"}, {"{SERVICE}"}, {"{DATE}"}, {"{TIME}"}, {"{STYLIST}"}
                  {activeMessageType === 'reschedule' && ', {OLD_DATE}, {OLD_TIME}, {NEW_DATE}, {NEW_TIME}'}
                </p>
              </div>

              {editedTemplate && (
                <>
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    className="w-full"
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>

                  {showPreview && (
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <Label className="text-blue-900 dark:text-blue-100 mb-2 block">Preview</Label>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded border text-sm whitespace-pre-wrap">
                        {getPreviewMessage()}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSaveTemplate}
                    className="w-full"
                  >
                    Save Template
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Tips for Great SMS Templates
          </h4>
          <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <li>• Keep messages under 160 characters when possible to avoid SMS splitting</li>
            <li>• Use emojis sparingly and test on different devices</li>
            <li>• Include essential details: service, date, time, and stylist</li>
            <li>• Maintain a professional yet friendly tone</li>
            <li>• Consider bilingual content (Spanish/English) for your audience</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
