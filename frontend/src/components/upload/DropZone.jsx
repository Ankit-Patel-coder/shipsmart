// src/components/upload/DropZone.jsx
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, ImagePlus, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ACCEPTED = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }
const MAX_SIZE = 20 * 1024 * 1024   // 20 MB
const MAX_FILES = 20

export default function DropZone({ onFiles, bulk = false, disabled = false }) {
  const [error, setError] = useState(null)

  const onDrop = useCallback((accepted, rejected) => {
    setError(null)
    if (rejected.length > 0) {
      const r = rejected[0]
      if (r.errors[0]?.code === 'file-too-large') setError('File too large. Maximum size is 20 MB.')
      else if (r.errors[0]?.code === 'file-invalid-type') setError('Invalid file type. Use JPEG, PNG, or WEBP.')
      else if (r.errors[0]?.code === 'too-many-files') setError(`Max ${MAX_FILES} files at once.`)
      else setError(r.errors[0]?.message || 'Invalid file')
      return
    }
    if (accepted.length) onFiles(accepted)
  }, [onFiles])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    maxFiles: bulk ? MAX_FILES : 1,
    multiple: bulk,
    disabled,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject ? 'border-brand-400 bg-brand-50 scale-[1.01]' : ''}
          ${isDragReject ? 'border-red-400 bg-red-50' : ''}
          ${!isDragActive && !isDragReject ? 'border-neutral-200 bg-neutral-50 hover:border-brand-300 hover:bg-brand-50/40' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {isDragActive ? (
            <motion.div key="drag" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-brand-100 rounded-2xl flex items-center justify-center">
                <Upload size={28} className="text-brand-600" />
              </div>
              <p className="text-brand-700 font-semibold text-lg">Drop your {bulk ? 'images' : 'image'} here</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-white border-2 border-neutral-200 rounded-2xl flex items-center justify-center shadow-sm">
                <ImagePlus size={26} className="text-neutral-400" />
              </div>
              <p className="text-neutral-800 font-semibold text-base mb-1">
                {bulk ? 'Drop up to 20 product images' : 'Drop your product image here'}
              </p>
              <p className="text-neutral-400 text-sm mb-5">JPEG, PNG, WEBP · Max 20 MB per image</p>
              <span className="btn-primary text-sm pointer-events-none">
                <Upload size={14} />
                Choose {bulk ? 'Images' : 'Image'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={15} />
          {error}
        </div>
      )}
    </div>
  )
}
