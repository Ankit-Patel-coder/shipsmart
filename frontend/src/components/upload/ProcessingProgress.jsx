// src/components/upload/ProcessingProgress.jsx
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'

const STEPS = [
  'Uploading image to server',
  'Removing background with AI',
  'Generating white background base',
  'Creating compressed variant',
  'Applying brightness & colour grades',
  'Processing crop & padding variants',
  'Calculating shipping scores',
  'Uploading 12 variants to storage',
  'Finalising results',
]

export default function ProcessingProgress({ progress, currentStep, fileName }) {
  const stepIndex = Math.min(Math.floor((progress / 100) * STEPS.length), STEPS.length - 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-8 max-w-lg mx-auto text-center"
    >
      {/* Spinner */}
      <div className="w-16 h-16 mx-auto mb-5 relative">
        <div className="absolute inset-0 rounded-full border-4 border-neutral-100" />
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32" cy="32" r="28"
            fill="none" stroke="#e84c3d" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold font-mono text-brand-600">{progress}%</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 mb-1">Processing your image</h3>
      {fileName && <p className="text-sm text-neutral-400 mb-5 truncate px-4">{fileName}</p>}

      {/* Current step */}
      <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 mb-6">
        <Loader2 size={14} className="animate-spin text-brand-500" />
        {STEPS[stepIndex]}...
      </div>

      {/* Step list */}
      <div className="text-left space-y-1.5">
        {STEPS.map((step, i) => {
          const done = i < stepIndex
          const active = i === stepIndex
          return (
            <div key={i} className={`flex items-center gap-2.5 text-xs px-3 py-1.5 rounded-lg transition-all
              ${active ? 'bg-brand-50 text-brand-700' : done ? 'text-neutral-500' : 'text-neutral-300'}`}>
              {done
                ? <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                : active
                  ? <Loader2 size={13} className="animate-spin text-brand-500 flex-shrink-0" />
                  : <div className="w-[13px] h-[13px] rounded-full border border-neutral-200 flex-shrink-0" />
              }
              {step}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
