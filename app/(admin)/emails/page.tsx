import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Badge } from "@/components/ui/badge"
import { Mail, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"

const categoryColors: Record<string, string> = {
  welcome: "success",
  followup: "info",
  proposal: "gold",
  booking: "success",
  checkin: "secondary",
  thankyou: "navy",
}

export default async function EmailsPage() {
  const templates = await db.emailTemplate.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  })

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Email Templates" subtitle={`${templates.length} email templates`} />

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map(template => (
            <div key={template.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    {template.isDefault && <Badge variant="navy" className="text-xs">Default</Badge>}
                  </div>
                  <Badge variant={(categoryColors[template.category] as any) || "secondary"} className="mt-1">
                    {template.category}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="text-xs text-gray-500 mb-0.5">Subject Line</div>
                <div className="text-sm font-medium text-gray-800">{template.subject}</div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                {template.bodyText?.slice(0, 200)}...
              </p>

              {template.variables && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Variables</div>
                  <div className="flex flex-wrap gap-1">
                    {JSON.parse(template.variables).map((v: string) => (
                      <span key={v} className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5 font-mono">{v}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {templates.length === 0 && (
            <div className="md:col-span-2 bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
              <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No email templates yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
