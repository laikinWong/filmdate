'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import Canvas, { type CanvasControls } from '@/components/Editor/Canvas'
import Toolbar from '@/components/Editor/Toolbar'
import LoadingScreen from '@/components/LoadingScreen'
import { getCurrentUser } from '@/lib/auth'
import { getCouple } from '@/lib/couple'
import { createBrowserClient } from '@/lib/supabase-browser'

export default function EditorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const canvasRef = useRef<CanvasControls | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const couple = await getCouple(user.id)
        if (!couple || !couple.user2_id) {
          router.push('/pair')
          return
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleCanvasReady = (controls: CanvasControls) => {
    canvasRef.current = controls
  }

  const handleAddImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = async (event) => {
        const url = event.target?.result as string
        if (canvasRef.current) {
          await canvasRef.current.addImage(url)
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handleAddText = () => {
    const text = prompt('输入文字:')
    if (text && canvasRef.current) {
      canvasRef.current.addText(text)
    }
  }

  const handleAddShape = (type: 'rect' | 'circle' | 'triangle') => {
    if (canvasRef.current) {
      canvasRef.current.addShape(type)
    }
  }

  const handleDelete = () => {
    if (canvasRef.current) {
      canvasRef.current.deleteSelected()
    }
  }

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo()
    }
  }

  const handleClear = () => {
    if (canvasRef.current && confirm('确定要清空画布吗？')) {
      canvasRef.current.clear()
    }
  }

  const handleExport = () => {
    if (!canvasRef.current) return

    const dataUrl = canvasRef.current.exportImage()
    if (!dataUrl) return

    const link = document.createElement('a')
    link.download = `filmdate-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }

  const handleSave = async () => {
    if (!canvasRef.current) return

    setSaving(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      const couple = await getCouple(user.id)
      if (!couple) return

      const canvas = canvasRef.current.getCanvas()
      if (!canvas) return

      const canvasData = canvas.toJSON()
      const thumbnailUrl = canvasRef.current.exportImage()

      const supabase = createBrowserClient()
      const { error } = await supabase
        .from('collages')
        .insert({
          couple_id: couple.id,
          title: title || '未命名作品',
          canvas_data: canvasData,
          thumbnail_url: thumbnailUrl,
        })

      if (error) throw error

      alert('保存成功！')
      router.push('/')
    } catch (err) {
      console.error(err)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-handwritten text-primary-dark mb-2">
            拼贴编辑器
          </h1>
          <p className="text-primary-dark/60">
            创作你们的复古胶片拼贴作品
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="给作品起个名字..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-primary-light border-2 border-primary-dark/20 rounded-lg focus:border-accent-gold focus:outline-none transition-colors text-lg font-handwritten"
            />
          </div>

          {/* Toolbar */}
          <Toolbar
            onAddImage={handleAddImage}
            onAddText={handleAddText}
            onAddShape={handleAddShape}
            onDelete={handleDelete}
            onUndo={handleUndo}
            onClear={handleClear}
            onExport={handleExport}
          />
          
          {/* Canvas */}
          <Canvas
            width={600}
            height={600}
            onCanvasReady={handleCanvasReady}
          />

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 p-3 bg-primary-dark text-primary-light rounded-lg hover:bg-primary-dark/90 transition-colors disabled:opacity-50 font-medium"
            >
              {saving ? '保存中...' : '保存作品'}
            </button>
            <button
              onClick={handleExport}
              className="px-6 p-3 bg-accent-gold text-primary-dark rounded-lg hover:bg-accent-gold/90 transition-colors font-medium"
            >
              导出图片
            </button>
          </div>

          {/* Tips */}
          <div className="text-center text-sm text-primary-dark/40">
            <p>提示：点击画布上的对象可以选中并编辑</p>
            <p>拖拽角落可以缩放，拖拽旋转手柄可以旋转</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
