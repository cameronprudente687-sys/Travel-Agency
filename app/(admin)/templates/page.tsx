import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { parseJsonField } from "@/lib/utils"
import { Map, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ItineraryBuilder } from "@/components/admin/ItineraryBuilder"
import { TemplateCard } from "@/components/admin/TemplateCard"
import { SearchBar } from "@/components/admin/SearchBar"
import { Suspense } from "react"

interface Props {
  searchParams: { q?: string }
}

export default async function TemplatesPage({ searchParams }: Props) {
  const searchQuery = searchParams.q || ""

  const where: any = {}
  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery } },
      { destination: { contains: searchQuery } },
      { country: { contains: searchQuery } },
      { summary: { contains: searchQuery } },
    ]
  }

  const templates = await db.itineraryTemplate.findMany({
    where,
    orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { days: true } } },
  })

  const signature = templates.filter(t => t.isSignature || t.isBestSeller)
  const standard = templates.filter(t => !t.isSignature && !t.isBestSeller)

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Template Library" subtitle={`${templates.length} itinerary templates`} />

      <div className="flex-1 p-6">
        {/* Collections + search + create */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Suspense>
              <SearchBar basePath="/templates" placeholder="Search templates..." />
            </Suspense>
            <ItineraryBuilder mode="template" trigger={<Button variant="navy"><Plus className="w-4 h-4 mr-1" /> Build New Template</Button>} />
          </div>
        </div>

        {searchQuery && (
          <p className="text-sm text-gray-500 mb-4">{templates.length} result{templates.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;</p>
        )}

        {/* Signature / Best Sellers */}
        {!searchQuery && signature.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Signature & Best Sellers</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {signature.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  styles={parseJsonField<string[]>(template.travelStyles, [])}
                  types={parseJsonField<string[]>(template.travelerTypes, [])}
                  highlights={parseJsonField<string[]>(template.highlights, [])}
                  featured
                />
              ))}
            </div>
          </div>
        )}

        {/* All / search results */}
        {(searchQuery ? templates : standard).length > 0 && (
          <div>
            {!searchQuery && signature.length > 0 && <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">All Templates</h2>}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(searchQuery ? templates : standard).map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  styles={parseJsonField<string[]>(template.travelStyles, [])}
                  types={parseJsonField<string[]>(template.travelerTypes, [])}
                  highlights={parseJsonField<string[]>(template.highlights, [])}
                />
              ))}
            </div>
          </div>
        )}

        {templates.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
            <Map className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-2">
              {searchQuery ? `No templates matching "${searchQuery}"` : "No templates yet"}
            </p>
            <ItineraryBuilder mode="template" trigger={<Button variant="navy"><Plus className="w-4 h-4 mr-1" /> Build New Template</Button>} />
          </div>
        )}
      </div>
    </div>
  )
}
