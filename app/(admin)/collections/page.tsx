import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import Link from "next/link"

export default async function CollectionsPage() {
  const collections = await db.tripCollection.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        include: { template: true },
        orderBy: { sortOrder: "asc" },
        take: 4,
      },
      _count: { select: { items: true } },
    },
  })

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Trip Collections" subtitle={`${collections.length} curated collections`} />

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {collections.map(col => (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{col.emoji}</div>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-1">
                  {col._count.items} trips
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-primary-900 group-hover:text-primary-600 transition-colors mb-1">
                {col.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{col.description}</p>

              <div className="flex flex-wrap gap-2">
                {col.items.map(item => (
                  <span key={item.id} className="text-xs text-primary-700 bg-primary-50 rounded-full px-2 py-0.5">
                    {item.template.flagEmoji} {item.template.destination}
                  </span>
                ))}
                {col._count.items > 4 && (
                  <span className="text-xs text-gray-400">+{col._count.items - 4} more</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
