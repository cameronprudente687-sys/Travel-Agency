import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { parseJsonField } from "@/lib/utils"
import { Clock, DollarSign } from "lucide-react"
import Link from "next/link"
import { CollectionActions } from "@/components/admin/CollectionActions"

export default async function CollectionDetailPage({ params }: { params: { id: string } }) {
  const collection = await db.tripCollection.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: { template: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  if (!collection) notFound()

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title={`${collection.emoji} ${collection.title}`}
        subtitle={collection.description}
      />

      <div className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <CollectionActions collection={collection} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {collection.items.map(item => {
            const template = item.template
            const styles = parseJsonField<string[]>(template.travelStyles, [])
            return (
              <Link
                key={item.id}
                href={`/templates/${template.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="bg-gradient-to-r from-primary-800 to-primary-700 p-5 text-white">
                  <div className="text-3xl mb-2">{template.flagEmoji}</div>
                  <h3 className="font-serif font-bold text-lg group-hover:text-gold-300 transition-colors">{template.title}</h3>
                  <p className="text-primary-200 text-sm">{template.destination}</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{template.summary}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {styles.slice(0, 2).map(s => (
                      <span key={s} className="text-xs bg-sand-100 text-primary-700 rounded-full px-2 py-0.5">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{template.durationDays} days</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{template.budgetLevel.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
