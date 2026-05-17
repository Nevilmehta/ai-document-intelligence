import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  File,
} from 'lucide-react'
import { documentsApi } from '../api/documents'
import type { SourceDocument } from '../types'
import { formatBytes, formatRelativeTime } from '../lib/utils'
import { EmptyState } from '../components/shared/EmptyState'
import { LoadingState } from '../components/shared/LoadingState'
import { GlassCard } from '../components/shared/GlassCard'

const CATEGORY_LABEL: Record<string, string> = {
  resume: 'Resume',
  cv: 'CV',
  portfolio: 'Portfolio',
  cover_letter: 'Cover Letter',
}

const EXT_ICON: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/plain': 'TXT',
}

export function UploadSource() {
  const [docs, setDocs] = useState<SourceDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchDocs = async () => {
    try {
      const data = await documentsApi.getSources()
      setDocs(data)
    } catch {
      // show empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocs() }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) setSelectedFile(file)
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    setUploadError(null)
    setUploadProgress(0)
    try {
      await documentsApi.uploadSource(selectedFile, setUploadProgress)
      setSelectedFile(null)
      await fetchDocs()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string | { msg: string }[] }; status?: number } }
      const detail = e?.response?.data?.detail
      const msg =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d.msg).join(', ')
          : `Upload failed (${e?.response?.status ?? 'network error'}). Check backend logs.`
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Upload zone */}
      <GlassCard>
        <h2 className="font-semibold text-slate-200 mb-4">Upload Source Document</h2>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !selectedFile && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ${
            selectedFile ? 'cursor-default' : 'cursor-pointer'
          } ${
            dragActive
              ? 'border-violet-500/50 bg-violet-500/[0.07]'
              : 'border-white/[0.10] hover:border-violet-500/30 hover:bg-white/[0.03]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              dragActive ? 'bg-violet-500/20' : 'bg-white/[0.04]'
            }`}>
              <Upload size={24} className={dragActive ? 'text-violet-400' : 'text-slate-500'} />
            </div>
            <div>
              <p className="font-medium text-slate-300">
                {dragActive ? 'Drop it here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-sm text-slate-500 mt-1">PDF only — up to {10} MB</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="glass-sm p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{formatBytes(selectedFile.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                  className="text-slate-600 hover:text-slate-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {uploading && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Uploading & extracting text...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full"
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mt-3 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{uploadError}</p>
                </div>
              )}

              {!uploading && (
                <button
                  onClick={handleUpload}
                  className="btn-primary mt-3 w-full justify-center"
                >
                  <Upload size={15} /> Upload Document
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Uploaded docs list */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-200">Uploaded Documents</h3>
          <span className="badge-neutral">{docs.length} files</span>
        </div>

        {loading ? (
          <LoadingState message="Loading documents..." />
        ) : docs.length === 0 ? (
          <EmptyState
            icon={Upload}
            title="No source documents yet"
            description="Upload a PDF resume or CV to get started with analysis."
          />
        ) : (
          <div className="space-y-2">
            {docs.map((doc, i) => {
              const isExpanded = expandedId === doc.id
              const preview = doc.cleaned_text || doc.extracted_text || ''
              const hasPreview = preview.length > 0
              const ext = EXT_ICON[doc.file_type] ?? 'FILE'
              const category = CATEGORY_LABEL[doc.document_category] ?? doc.document_category

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-sm overflow-hidden"
                >
                  {/* Row */}
                  <div className="flex items-center gap-3 p-4">
                    {/* File type badge */}
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-violet-400 tracking-wide">{ext}</span>
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">
                        {doc.original_file_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="badge-info text-[10px]">{category}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} /> {formatRelativeTime(doc.created_at)}
                        </span>
                        {hasPreview && (
                          <span className="text-xs text-slate-600">
                            ~{Math.ceil(preview.split(/\s+/).filter(Boolean).length)} words
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {hasPreview && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                          className="btn-ghost text-xs gap-1 py-1.5 px-2.5"
                          title="Preview extracted text"
                        >
                          <Eye size={13} />
                          {isExpanded ? 'Hide' : 'Preview'}
                          {isExpanded
                            ? <ChevronUp size={11} />
                            : <ChevronDown size={11} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable text preview */}
                  <AnimatePresence>
                    {isExpanded && hasPreview && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/[0.06] mx-4" />
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <File size={12} className="text-slate-500" />
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Extracted Text Preview
                            </span>
                          </div>
                          <div className="bg-white/[0.02] rounded-xl p-4 max-h-56 overflow-y-auto">
                            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap font-mono text-[12px]">
                              {preview}
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-2 text-right">
                            {preview.length} characters total
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
