// src/components/variants/VariantCard.jsx
import { useState } from 'react'
import { Download, ZoomIn } from 'lucide-react'
import ScoreBadge, { scoreColor } from '../ui/ScoreBadge'
import toast from 'react-hot-toast'

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function VariantCard({ variant, index }) {
  const [downloading, setDownloading] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [hovered, setHovered] = useState(false)
  const c = scoreColor(variant.score)

  const handleDownload = async () => {
    try {
      setDownloading(true)
      const a = document.createElement('a')
      a.href = variant.url
      a.download = `shipsmart-${variant.name.replace(/\s+/g, '-').toLowerCase()}-score${variant.score}.jpg`
      a.target = '_blank'
      a.click()
    } catch {
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`card overflow-hidden flex flex-col transition-all duration-200 cursor-pointer
          ${hovered ? 'ring-2 ring-brand-400 shadow-lg scale-[1.02]' : 'hover:shadow-md'}`}
      >
        {/* Image */}
        <div className="relative group bg-neutral-50" onClick={() => setLightbox(true)}>
          <img
            src={variant.url}
            alt={variant.name}
            className="w-full aspect-square object-contain"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/15 transition-all opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
              <ZoomIn size={16} className="text-neutral-800" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 leading-tight">{variant.name}</h3>
              <p className="text-xs text-neutral-500 mt-0.5 leading-snug">{variant.description}</p>
            </div>
            <ScoreBadge score={variant.score} size="sm" />
          </div>

          {/* Score bar */}
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${c.bar}`} style={{ width: `${variant.score}%` }} />
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[11px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
              {formatBytes(variant.fileSize)}
            </span>
            <span className="text-[11px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
              {variant.width}×{variant.height}
            </span>
            {variant.score >= 80 && (
              <span className="text-[11px] font-mono bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                Low shipping
              </span>
            )}
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="mt-auto w-full flex items-center justify-center gap-2 py-2 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all disabled:opacity-50"
          >
            <Download size={13} />
            {downloading ? 'Downloading...' : 'Download JPG'}
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <div className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={variant.url} alt={variant.name} className="w-full object-contain max-h-[70vh]" />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-neutral-900">{variant.name}</p>
                <p className="text-sm text-neutral-500">{variant.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <ScoreBadge score={variant.score} />
                <button onClick={handleDownload} className="btn-primary text-xs px-3 py-2">
                  <Download size={13} /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
