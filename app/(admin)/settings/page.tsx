import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default async function SettingsPage() {
  const settings = await db.businessSetting.findMany({
    orderBy: [{ group: "asc" }, { label: "asc" }],
  })

  const grouped = settings.reduce((acc, s) => {
    const group = s.group || "general"
    if (!acc[group]) acc[group] = []
    acc[group].push(s)
    return acc
  }, {} as Record<string, typeof settings>)

  const groupLabels: Record<string, string> = {
    general: "General Settings",
    branding: "Branding & Identity",
    email: "Email Configuration",
    notifications: "Notification Preferences",
  }

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Settings" subtitle="Business configuration and preferences" />

      <div className="flex-1 p-6 max-w-3xl space-y-6">
        {Object.entries(grouped).map(([group, groupSettings]) => (
          <div key={group} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-5">{groupLabels[group] || group}</h3>
            <div className="space-y-4">
              {groupSettings.map(setting => (
                <div key={setting.id} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700">{setting.label || setting.key}</Label>
                    {setting.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{setting.description}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {setting.type === "boolean" ? (
                      <Switch defaultChecked={setting.value === "true"} />
                    ) : (
                      <Input
                        defaultValue={setting.value}
                        className="w-64 text-sm"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button variant="navy">Save Settings</Button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
          <h3 className="font-semibold text-red-700 mb-3">Account</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-800">Reset Demo Data</div>
              <div className="text-xs text-gray-500">Re-run seed to restore all demo data</div>
            </div>
            <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
              Reset Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
