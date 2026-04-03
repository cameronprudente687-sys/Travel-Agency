import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { SettingsForm } from "@/components/admin/SettingsForm"

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

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Settings" subtitle="Business configuration and preferences" />
      <SettingsForm settings={grouped} />
    </div>
  )
}
