import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { parseJsonField } from "@/lib/utils"
import { Map, Star, Clock, DollarSign, Users, Compass, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TemplateFormDialog } from "@/components/admin/TemplateFormDialog"
import { TemplateActions } from "@/components/admin/TemplateActions"

const budgetLabel: Record<string, string> = {
  UNDER_3K: "Budget", THREE_TO_5K: "Mid-Range", FIVE_TO_10K: "Premium",
  TEN_TO_20K: "Luxury", OVER_20K: "Ultra Luxury",
}

export default async function TemplatesPage() {
  const templates = await db.itineraryTemplate.findMany({
    orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { days: true, collections: true } } },
  })

  const collections = await db.tripCollection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { items: true } } },
  })

  // Group: featured first, then rest
  const signature = templates.filter(t => t.isSignature || t.isBestSeller)
  const standard = templates.filter(t => !t.isSignature && !t.isBestSeller)

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Template Library" subtitle={`${templates.length} itinerary templates`} />

      <div className="flex-1 p-6">
        {/* Collections + Create */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {collections.map(c => (
              <Link
                key={c.id}
                href={`/collections/${c.id}`}
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                {c.emoji} {c.title}
                <span className="text-xs text-gray-400">{c._count.items}</span>
              </Link>
            ))}
          </div>
          <TemplateFormDialog />
        </div>

        {/* Signature / Best Sellers */}
        {signature.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Signature & Best Sellers</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {signature.map(template => (
                <TemplateCard key={template.id} template={template} featured />
              ))}
            </div>
          </div>
        )}

        {/* All templates */}
        {standard.length > 0 && (
          <div>
            {signature.length > 0 && <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">All Templates</h2>}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {standard.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        )}

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

function TemplateCard({ template, featured }: { template: any; featured?: boolean }) {
  const styles = parseJsonField<string[]>(template.travelStyles, [])
  const highlights = parseJsonField<string[]>(template.highlights, [])
  const types = parseJsonField<string[]>(template.travelerTypes, [])

  return (
    <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden group ${featured ? "" : ""}`}>
      {/* Compact header */}
      <div className="bg-primary-900 px-5 py-4 text-white flex items-center gap-3">
        <span className="text-3xl shrink-0">{template.flagEmoji}</span>
        <div className="flex-1 min-w-0">
          <Link href={`/templates/${template.id}`} className="font-serif font-bold text-lg leading-tight hover:text-gold-300 transition-colors block truncate">
            {template.title}
          </Link>
          <p className="text-primary-300 text-sm truncate">{template.destination}, {template.country}</p>
        </div>
        {template.isSignature && <span className="shrink-0 text-xs bg-gold-500 text-white rounded-full px-2 py-0.5 font-medium">Signature</span>}
        {template.isBestSeller && !template.isSignature && <span className="shrink-0 text-xs bg-green-500 text-white rounded-full px-2 py-0.5 font-medium">Best Seller</span>}
      </div>

      <div className="p-5 space-y-3">
        {/* Key stats — the most scannable info */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" /> {template.durationDays} days</span>
          <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-gray-400" /> {budgetLabel[template.budgetLevel]}</span>
          <span className="flex items-center gap-1"><Map className="w-3.5 h-3.5 text-gray-400" /> {template._count.days} day plans</span>
          {template.basePrice && <span className="ml-auto font-semibold text-primary-700">from ${template.basePrice.toLocaleString()}</span>}
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{template.summary}</p>

        {/* Top highlights — shows value fast */}
        {featured && highlights.length > 0 && (
          <div className="space-y-1">
            {highlights.slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                <Star className="w-3 h-3 text-gold-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tags — compact, useful */}
        <div className="flex flex-wrap gap-1.5">
          {styles.slice(0, 3).map(s => (
            <span key={s} className="text-xs text-primary-700 bg-primary-50 rounded px-1.5 py-0.5">{s}</span>
          ))}
          {types.slice(0, 2).map(t => (
            <span key={t} className="text-xs text-gray-500 bg-gray-50 rounded px-1.5 py-0.5">{t.replace(/_/g, " ")}</span>
          ))}
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-gray-100">
          <TemplateActions template={template} />
        </div>
      </div>
    </div>
  )
}
