// src/pages/UploadPage.jsx
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { imageApi } from '../lib/api'
import DropZone from '../components/upload/DropZone'
import ProcessingProgress from '../components/upload/ProcessingProgress'
import { useAuthStore } from '../context/authStore'
import toast from 'react-hot-toast'
import { Upload, Layers } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SIMULATE_STEPS = [0, 8, 15, 25, 35, 50, 60, 72, 83, 90, 96, 100]

export default function UploadPage() {
  const [mode, setMode] = useState('single')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState(null)
  const [bulkFiles, setBulkFiles] = useState([])
  const [bulkResults, setBulkResults] = useState(null)
  const { updateUser, user } = useAuthStore()
  const navigate = useNavigate()

  // Simulate progress steps while server processes
  const simulateProgress = () => {
    let i = 0
    const interval = setInterval(() => {
      if (i < SIMULATE_STEPS.length - 1) {
        i++
        setProgress(SIMULATE_STEPS[i])
      } else {
        clearInterval(interval)
      }
    }, 900)
    return interval
  }

  const handleSingleUpload = useCallback(async (files) => {
    const file = files[0]
    setCurrentFile(file.name)
    setProcessing(true)
    setProgress(0)
    const timer = simulateProgress()

    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await imageApi.upload(formData)
      clearInterval(timer)
      setProgress(100)
      updateUser({ imagesUsed: (user?.imagesUsed || 0) + 1 })
      toast.success('12 variants generated!')
      setTimeout(() => navigate(`/upload/${data.data.uploadId}`), 600)
    } catch (err) {
      clearInterval(timer)
      setProcessing(false)
      setProgress(0)
      toast.error(err.response?.data?.message || 'Upload failed')
    }
  }, [navigate, updateUser, user])

  const handleBulkUpload = useCallback(async (files) => {
    setBulkFiles(files.map(f => ({ name: f.name, status: 'pending' })))
    setProcessing(true)
    setProgress(0)

    try {
      const formData = new FormData()
      files.forEach(f => formData.append('images', f))
      const { data } = await imageApi.uploadBulk(formData, (pct) => setProgress(Math.min(pct, 90)))
      setProgress(100)
      setBulkResults(data.data)
      updateUser({ imagesUsed: (user?.imagesUsed || 0) + data.data.processed })
      toast.success(`${data.data.processed} images processed!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk upload failed')
    } finally {
      setProcessing(false)
    }
  }, [updateUser, user])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Upload Images</h1>
        <p className="text-neutral-500 mt-1 text-sm">Get 12 shipping-optimised variants per image</p>
      </div>

      {/* Mode toggle */}
      {!processing && !bulkResults && (
        <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit mb-6">
          {[
            { id: 'single', label: 'Single image', icon: Upload },
            { id: 'bulk',   label: 'Bulk upload',  icon: Layers },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setMode(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${mode === id ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {processing ? (
          <ProcessingProgress key="progress" progress={progress} fileName={currentFile} />
        ) : bulkResults ? (
          <motion.div key="bulk-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">
              Bulk processing complete — {bulkResults.processed}/{bulkResults.processed + bulkResults.failed} succeeded
            </h2>
            <div className="space-y-2">
              {bulkResults.results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-neutral-700 flex-1">{r.file}</span>
                  <span className="text-xs font-mono text-green-700 font-semibold">Score: {r.bestScore}/100</span>
                  <button onClick={() => navigate(`/upload/${r.uploadId}`)} className="text-xs text-brand-600 font-medium hover:underline">View →</button>
                </div>
              ))}
              {bulkResults.errors?.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-neutral-700 flex-1">{e.file}</span>
                  <span className="text-xs text-red-600">{e.error}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setBulkResults(null); setProgress(0) }} className="btn-secondary text-sm">
                Upload more
              </button>
              <button onClick={() => navigate('/history')} className="btn-primary text-sm">
                View in history
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DropZone
              onFiles={mode === 'single' ? handleSingleUpload : handleBulkUpload}
              bulk={mode === 'bulk'}
            />
            {mode === 'bulk' && (
              <p className="mt-3 text-xs text-neutral-400 text-center">
                Upload up to 20 images at once · Each generates 12 variants · Processed sequentially
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
