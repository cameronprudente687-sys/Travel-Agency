import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Badge } from "@/components/ui/badge"
import { parseJsonField } from "@/lib/utils"
import { Map, Star, Clock, DollarSign, Users, Compass } from "lucide-react"
import Link from "next/link"
import { TemplateFormDialog } from "@/components/admin/TemplateFormDialog"

const budgetLabel: Record<string, string> = {
  UNDER_3K: "Budget", THREE_TO_5K: "Mid-Range", FIVE_TO_10K: "Premium",
  TEN_TO_20K: "Luxury", OVER_20K: "Ultra Luxury",
}

const paceLabel: Record<string, string> = {
  slow: "Slow & Deep", moderate: "Balanced", fast: "Active & Full",
}

const gradients = [
  "from-primary-900 via-primary-800 to-primary-700",
  "from-teal-900 via-teal-800 to-emerald-700",
  "from-indigo-900 via-indigo-800 to-violet-700",
  "from-rose-900 via-rose-800 to-pink-700",
  "from-amber-900 via-amber-800 to-orange-700",
  "from-slate-900 via-slate-800 to-gray-700",
]

export default async function TemplatesPage() {
  const templates = await db.itineraryTemplate.findMany({
    orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { days: true, collections: true } } },
  })

  const collections = await db.tripCollection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { items: true } } },
  })

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Template Library" subtitle={`${templates.length} itinerary templates ready to use`} />

      <div className="flex-1 p-6">
        {/* Collections + Create */}
        <div className="flex items-center justify-between mb-6">
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
          <TemplateFormDialog />
        </div>

        {/* Templates grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template, idx) => {
            const styles = parseJsonField<string[]>(template.travelStyles, [])
            const types = parseJsonField<string[]>(template.travelerTypes, [])
            const highlights = parseJsonField<string[]>(template.highlights, [])
            const gradient = gradients[idx % gradients.length]

            return (
              <Link
                key={template.id}
                href={`/templates/${template.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden group"
              >
                {/* Hero header */}
                <div className={`bg-gradient-to-br ${gradient} p-6 text-white relative`}>
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-1">
                    {template.isSignature && (
                      <span className="bg-gold-500 text-white text-xs font-semibold rounded-full px-2.5 py-0.5 flex items-center gap-1">
                        <Compass className="w-3 h-3" /> Signature
                      </span>
                    )}
                    {template.isBestSeller && (
                      <span className="bg-green-500 text-white text-xs font-semibold rounded-full px-2.5 py-0.5 flex items-center gap-1">
                        <Star className="w-3 h-3" /> Best Seller
                      </span>
                    )}
                  </div>

                  <div className="text-4xl mb-3">{template.flagEmoji}</div>
                  <h3 className="font-serif font-bold text-xl leading-tight group-hover:text-gold-200 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">{template.destination}, {template.country}</p>

                  {/* Quick stats */}
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/20 text-sm text-white/80">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {template.durationDays} days</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {budgetLabel[template.budgetLevel]}</span>
                    {template.basePrice && <span className="ml-auto font-semibold text-gold-300">from ${template.basePrice.toLocaleString()}</span>}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{template.summary}</p>

                  {/* Highlights preview */}
                  {highlights.length > 0 && (
                    <div className="space-y-1">
                      {highlights.slice(0, 3).map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <Star className="w-3 h-3 text-gold-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{h}</span>
                        </div>
                      ))}
                      {highlights.length > 3 && (
                        <span className="text-xs text-gray-400 pl-5">+{highlights.length - 3} more highlights</span>
                      )}
                    </div>
                  )}

                  {/* Style & type tags */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100">
                    {styles.slice(0, 3).map(s => (
                      <span key={s} className="text-xs bg-primary-50 text-primary-700 rounded-full px-2 py-0.5">{s}</span>
                    ))}
                    {types.slice(0, 2).map(t => (
                      <span key={t} className="text-xs bg-sand-100 text-gray-600 rounded-full px-2 py-0.5 flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" /> {t.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>

                  {/* Footer meta */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
                    <span>{template._count.days} day plans · {paceLabel[template.paceLevel] || template.paceLevel} pace</span>
                    {template._count.collections > 0 && (
                      <span>In {template._count.collections} collection{template._count.collections > 1 ? "s" : ""}</span>
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
            <TemplateFormDialog />
          </div>
        )}
      </div>
    </div>
  )
}
