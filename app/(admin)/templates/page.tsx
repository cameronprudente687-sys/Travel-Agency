import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Badge } from "@/components/ui/badge"
import { parseJsonField } from "@/lib/utils"
import { Map, Star, Clock, DollarSign, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const budgetLabel: Record<string, string> = {
  UNDER_3K: "Budget",
  THREE_TO_5K: "Mid-Range",
  FIVE_TO_10K: "Premium",
  TEN_TO_20K: "Luxury",
  OVER_20K: "Ultra Luxury",
}

export default async function TemplatesPage() {
  const templates = await db.itineraryTemplate.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { days: true } } },
  })

  const collections = await db.tripCollection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { items: true } } },
  })

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title="Template Library"
        subtitle={`${templates.length} active itinerary templates`}
      />

      <div className="flex-1 p-6">
        {/* Collections quick nav */}
        {collections.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Collections</h3>
            <div className="flex flex-wrap gap-2">
              {collections.map(c => (
                <Link
                  key={c.id}
                  href={`/collections/${c.id}`}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
                >
                  <span>{c.emoji}</span>
                  <span>{c.title}</span>
                  <span className="text-xs text-gray-400">({c._count.items})</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {templates.map(template => {
            const styles = parseJsonField<string[]>(template.travelStyles, [])
            const highlights = parseJsonField<string[]>(template.highlights, [])

            return (
              <Link
                key={template.id}
                href={`/templates/${template.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-800 to-primary-700 p-5 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-3xl mb-2">{template.flagEmoji}</div>
                      <h3 className="font-serif font-bold text-lg leading-tight group-hover:text-gold-300 transition-colors">
                        {template.title}
                      </h3>
                      <div className="text-primary-200 text-sm mt-1">{template.destination}, {template.country}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {template.isSignature && (
                        <Badge variant="gold" className="text-xs">Signature</Badge>
                      )}
                      {template.isBestSeller && (
                        <Badge variant="success" className="text-xs">Best Seller</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                    {template.summary}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {styles.slice(0, 3).map(s => (
                      <span key={s} className="text-xs bg-sand-100 text-primary-700 rounded-full px-2 py-0.5">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.durationDays} days
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {budgetLabel[template.budgetLevel] || template.budgetLevel}
                    </div>
                    <div className="flex items-center gap-1">
                      <Map className="w-3 h-3" />
                      {template._count.days} day plans
                    </div>
                    {template.basePrice && (
                      <div className="ml-auto font-medium text-primary-700">
                        from ${template.basePrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {templates.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
            <Map className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-2">No templates yet</p>
            <p className="text-gray-400 text-sm mb-6">Run the seed script to populate template data</p>
            <Button variant="navy" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
