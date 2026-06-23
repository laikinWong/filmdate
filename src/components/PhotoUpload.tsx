'use client'

import { useState, useRef, useEffect } from 'react'
import { applyFilter, addFilmGrain, addVignette } from '@/lib/filters'

interface PhotoUploadProps {
  onUpload: (file: File, filteredBlob: Blob) => void
  filterId?: string
  disabled?: boolean
}

export default function PhotoUpload({ onUpload, filterId, disabled }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB')
      return
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (!preview || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas size to image size (max 1200px)
      const maxSize = 1200
      let width = img.width
      let height = img.height

      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      // Apply filter if selected
      if (filterId) {
        applyFilter(canvas, filterId)
        addFilmGrain(canvas, 0.05)
        addVignette(canvas, 0.2)
      }
    }
    img.src = preview
  }, [preview, filterId])

  const handleSubmit = async () => {
    if (!canvasRef.current || !fileInputRef.current?.files?.[0]) return

    const blob = await new Promise<Blob>((resolve) => {
      canvasRef.current!.toBlob((b) => resolve(b!), 'image/jpeg', 0.9)
    })

    onUpload(fileInputRef.current.files[0], blob)
  }

  const handleClear = () => {
    setPreview(null)
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      {!preview ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full h-64 border-2 border-dashed border-primary-dark/20 rounded-xl flex flex-col items-center justify-center hover:border-accent-gold hover:bg-accent-gold/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-12 h-12 text-primary-dark/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-primary-dark/40 font-medium">点击上传照片</span>
          <span className="text-primary-dark/30 text-sm mt-1">支持 JPG, PNG, GIF 等格式</span>
        </button>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl border-2 border-primary-dark/10"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={handleClear}
              className="bg-primary-dark/80 text-primary-light p-2 rounded-full hover:bg-primary-dark transition-colors"
              title="清除"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {fileName && (
            <div className="mt-2 text-sm text-primary-dark/60 truncate">
              {fileName}
            </div>
          )}
        </div>
      )}

      {preview && (
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="w-full p-3 bg-primary-dark text-primary-light rounded-lg hover:bg-primary-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          提交照片
        </button>
      )}
    </div>
  )
}
