"use client"

import { useRef, useState } from "react"
import { updateSettings } from "@/actions/settings"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface Setting {
  id: string
  key: string
  value: string
  type: string
  label: string | null
  description: string | null
  group: string | null
}

interface SettingsFormProps {
  settings: Record<string, Setting[]>
}

const groupLabels: Record<string, string> = {
  general: "General Settings",
  branding: "Branding & Identity",
  email: "Email Configuration",
  notifications: "Notification Preferences",
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const groupSettings of Object.values(settings)) {
      for (const setting of groupSettings) {
        initial[setting.key] = setting.value
      }
    }
    return initial
  })

  const [savingGroup, setSavingGroup] = useState<string | null>(null)

  function handleInputChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSwitchChange(key: string, checked: boolean) {
    setValues((prev) => ({ ...prev, [key]: checked ? "true" : "false" }))
  }

  async function handleSaveGroup(group: string) {
    setSavingGroup(group)
    try {
      const groupSettings = settings[group]
      const updates = groupSettings.map((setting) => ({
        key: setting.key,
        value: values[setting.key],
      }))
      await updateSettings(updates)
      toast.success(`${groupLabels[group] || group} saved successfully`)
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSavingGroup(null)
    }
  }

  return (
    <div className="flex-1 p-6 max-w-3xl space-y-6">
      {Object.entries(settings).map(([group, groupSettings]) => (
        <div key={group} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-5">
            {groupLabels[group] || group}
          </h3>
          <div className="space-y-4">
            {groupSettings.map((setting) => (
              <div key={setting.id} className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-gray-700">
                    {setting.label || setting.key}
                  </Label>
                  {setting.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{setting.description}</p>
                  )}
                </div>
                <div className="shrink-0">
                  {setting.type === "boolean" ? (
                    <Switch
                      checked={values[setting.key] === "true"}
                      onCheckedChange={(checked) =>
                        handleSwitchChange(setting.key, checked)
                      }
                    />
                  ) : (
                    <Input
                      value={values[setting.key]}
                      onChange={(e) => handleInputChange(setting.key, e.target.value)}
                      className="w-64 text-sm"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-5">
            <Button
              variant="navy"
              onClick={() => handleSaveGroup(group)}
              disabled={savingGroup === group}
            >
              {savingGroup === group ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      ))}

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
        <h3 className="font-semibold text-red-700 mb-3">Account</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-800">Reset Demo Data</div>
            <div className="text-xs text-gray-500">Re-run seed to restore all demo data</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Reset Data
          </Button>
        </div>
      </div>
    </div>
  )
}
