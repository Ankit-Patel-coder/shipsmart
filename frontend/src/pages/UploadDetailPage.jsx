// src/pages/UploadDetailPage.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { imageApi } from '../lib/api'
import VariantCard from '../components/variants/VariantCard'
import { VariantCardSkeleton } from '../components/ui/Skeleton'
import ScoreBadge from '../components/ui/ScoreBadge'
import toast from 'react-hot-toast'
import { ArrowLeft, Download, Trash2, ImagePlus } from 'lucide-react'
import { useState } from 'react'

function formatBytes(b) {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(2) + ' MB'
}

export default function UploadDetailPage() {
  const { uploadId } = useParams()
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['upload', uploadId],
    queryFn: () => imageApi.get(uploadId).then(r => r.data.data.upload),
  })

  const handleDownloadAll = async () => {
    setDownloading(true)
    try {
      const response = await imageApi.downloadZip(uploadId)
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `shipsmart-${uploadId.slice(0, 8)}.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('ZIP downloaded!')
    } catch {
      toast.error('Download failed. Try individual downloads.')
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this upload and all its variants? This cannot be undone.')) return
    setDeleting(true)
    try {
      await imageApi.delete(uploadId)
      toast.success('Upload deleted')
      navigate('/history')
    } catch {
      toast.error('Delete failed')
      setDeleting(false)
    }
  }

  if (error) return (
    <div className="p-6 text-center">
      <p className="text-neutral-500">Upload not found.</p>
      <button onClick={() => navigate('/history')} className="btn-secondary text-sm mt-4">Back to history</button>
    </div>
  )

  const upload = data
  const topVariant = upload?.variants?.[0]
  const bestScore = topVariant?.score ?? 0
  const savings = bestScore >= 85 ? '₹20–35' : bestScore >= 70 ? '₹10–20' : bestScore >= 55 ? '₹0–10' : '₹0'

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-neutral-900 truncate">
            {isLoading ? '...' : upload?.originalName}
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {isLoading ? '' : `${upload?.variantsCount} variants · ${new Date(upload?.createdAt).toLocaleDateString('en-IN')}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDelete} disabled={deleting || isLoading} className="btn-secondary text-sm text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button onClick={handleDownloadAll} disabled={downloading || isLoading} className="btn-primary text-sm">
            <Download size={14} /> {downloading ? 'Zipping...' : 'Download all (ZIP)'}
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {!isLoading && upload && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden mb-6">
          {[
            { label: 'Original size',    value: formatBytes(upload.originalSize) },
            { label: 'Best variant size', value: topVariant ? formatBytes(topVariant.fileSize) : '—' },
            { label: 'Best score',        value: <ScoreBadge score={bestScore} size="sm" /> },
            { label: 'Est. saving',       value: savings + ' / order' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white px-4 py-3.5 text-center">
              <div className="text-sm font-semibold text-neutral-900">{value}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Variants grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? [...Array(12)].map((_, i) => <VariantCardSkeleton key={i} />)
          : upload?.variants.map((v, i) => (
              <VariantCard key={v.id} variant={v} index={i} uploadId={uploadId} />
            ))
        }
      </div>

      {/* Add more */}
      {!isLoading && (
        <div className="mt-8 text-center">
          <button onClick={() => navigate('/upload')} className="btn-secondary text-sm">
            <ImagePlus size={14} /> Upload another image
          </button>
        </div>
      )}
    </div>
  )
}
