// src/pages/DashboardPage.jsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { userApi } from '../lib/api'
import { useAuthStore } from '../context/authStore'
import ScoreBadge from '../components/ui/ScoreBadge'
import Skeleton from '../components/ui/Skeleton'
import { Upload, TrendingUp, Package, Zap, ArrowRight, Clock } from 'lucide-react'


function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100">
          <Icon size={18} className="text-neutral-500" />
        </div>
      </div>
      <div className="text-2xl font-semibold text-neutral-900 font-mono mb-0.5">{value}</div>
      <div className="text-sm text-neutral-600 font-medium">{label}</div>
      {sub && <div className="text-xs text-neutral-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => userApi.dashboard().then(r => r.data.data),
  })

  const quota = user
    ? { used: user.imagesUsed, limit: user.imagesLimit, pct: user.imagesLimit === -1 ? 0 : Math.round((user.imagesUsed / user.imagesLimit) * 100) }
    : null

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-neutral-500 mt-0.5 text-sm">Here's your ShipSmart overview</p>
        </div>
        <Link to="/upload" className="btn-primary text-sm"><Upload size={14} /> New upload</Link>
      </div>

      {/* Quota */}
      {quota && user?.plan !== 'UNLIMITED' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-neutral-900">Image quota</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {quota.used} of {quota.limit === -1 ? 'Unlimited' : quota.limit} images used on {user.plan} plan
              </p>
            </div>
            {user.plan === 'FREE' && (
              <Link to="/pricing" className="btn-primary text-xs px-3 py-2"><Zap size={12} /> Upgrade</Link>
            )}
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${quota.pct >= 90 ? 'bg-red-500' : quota.pct >= 70 ? 'bg-amber-500' : 'bg-brand-500'}`}
              style={{ width: `${Math.min(100, quota.pct)}%` }} />
          </div>
          <p className="text-xs text-neutral-400 mt-2">{quota.pct}% used · {quota.limit - quota.used} remaining</p>
        </div>
      )}

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total uploads"   value={data?.stats.totalUploads  ?? 0} icon={Package}    sub="All time" />
          <StatCard label="Total variants"  value={data?.stats.totalVariants ?? 0} icon={Zap}        sub="Generated" />
          <StatCard label="Avg score"       value={`${data?.stats.avgScore ?? 0}/100`} icon={TrendingUp} sub="Shipping optimisation" />
          <StatCard label="Best score ever" value={`${data?.stats.topScore ?? 0}/100`} icon={TrendingUp} sub="Your best image" />
        </div>
      )}

      {/* Recent uploads */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-neutral-900 text-base">Recent uploads</h2>
          <Link to="/history" className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        ) : !data?.recentUploads?.length ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Upload size={20} className="text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-medium mb-1">No uploads yet</p>
            <p className="text-neutral-400 text-sm mb-4">Upload your first product image to get started</p>
            <Link to="/upload" className="btn-primary text-sm"><Upload size={14} /> Upload your first image</Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {data.recentUploads.map((upload) => (
              <Link key={upload.id} to={`/upload/${upload.id}`}
                className="flex items-center gap-5 py-4 hover:bg-neutral-50 -mx-2 px-2 rounded-xl transition-colors group">

                {/* Bigger thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-100">
                  {upload.topVariant?.url
                    ? <img src={upload.topVariant.url} alt="" className="w-full h-full object-contain p-1" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-neutral-300" /></div>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{upload.originalName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={12} className="text-neutral-400" />
                    <span className="text-xs text-neutral-400">{new Date(upload.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span className="text-xs text-neutral-300">·</span>
                    <span className="text-xs text-neutral-500">{upload.variantsCount} variants</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {upload.topVariant && <ScoreBadge score={upload.topVariant.score} size="sm" />}
                  <ArrowRight size={15} className="text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
