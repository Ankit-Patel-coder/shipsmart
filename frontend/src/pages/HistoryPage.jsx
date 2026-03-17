// src/pages/HistoryPage.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { imageApi } from '../lib/api'
import ScoreBadge from '../components/ui/ScoreBadge'
import Skeleton from '../components/ui/Skeleton'
import { Package, ArrowRight, Search, Clock } from 'lucide-react'

export default function HistoryPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['uploads', page],
    queryFn: () => imageApi.list(page, 20).then(r => r.data.data),
    keepPreviousData: true,
  })

  const filtered = search
    ? data?.uploads?.filter(u => u.originalName.toLowerCase().includes(search.toLowerCase()))
    : data?.uploads

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Upload history</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{data?.pagination?.total ?? '—'} total uploads</p>
        </div>
        <Link to="/upload" className="btn-primary text-sm">+ New upload</Link>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input className="input pl-10" placeholder="Search by file name..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : !filtered?.length ? (
        <div className="card p-14 text-center">
          <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={22} className="text-neutral-400" />
          </div>
          <p className="font-medium text-neutral-700 mb-1">{search ? 'No results found' : 'No uploads yet'}</p>
          <p className="text-sm text-neutral-400 mb-4">{search ? 'Try a different search term' : 'Upload your first product image'}</p>
          {!search && <Link to="/upload" className="btn-primary text-sm">Upload image</Link>}
        </div>
      ) : (
        <div className="card divide-y divide-neutral-100 overflow-hidden">
          {filtered.map((upload) => (
            <Link key={upload.id} to={`/upload/${upload.id}`}
              className="flex items-center gap-5 p-5 hover:bg-neutral-50 transition-colors group">

              {/* Bigger thumbnail */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-100">
                {upload.topVariant?.url
                  ? <img src={upload.topVariant.url} alt="" className="w-full h-full object-contain p-1" />
                  : <div className="w-full h-full flex items-center justify-center"><Package size={22} className="text-neutral-300" /></div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-neutral-900 truncate mb-1">{upload.originalName}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sm text-neutral-400">
                    <Clock size={13} />
                    {new Date(upload.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-sm text-neutral-400">{upload.variantsCount} variants</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    upload.status === 'DONE' ? 'bg-green-50 text-green-700' :
                    upload.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {upload.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {(upload.originalSize / 1024).toFixed(0)} KB original
                </p>
              </div>

              {/* Score + arrow */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {upload.topVariant && <ScoreBadge score={upload.topVariant.score} size="md" />}
                <ArrowRight size={16} className="text-neutral-300 group-hover:text-neutral-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-4">← Prev</button>
          <span className="flex items-center text-sm text-neutral-500 px-3">{page} / {data.pagination.pages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pagination.pages} className="btn-secondary text-sm px-4">Next →</button>
        </div>
      )}
    </div>
  )
}
