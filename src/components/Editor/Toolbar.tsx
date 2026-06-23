'use client'

import { useState } from 'react'

interface ToolbarProps {
  onAddImage: () => void
  onAddText: () => void
  onAddShape: (type: 'rect' | 'circle' | 'triangle') => void
  onDelete: () => void
  onUndo: () => void
  onClear: () => void
  onExport: () => void
}

export default function Toolbar({
  onAddImage,
  onAddText,
  onAddShape,
  onDelete,
  onUndo,
  onClear,
  onExport,
}: ToolbarProps) {
  const [showShapes, setShowShapes] = useState(false)

  const shapes = [
    { type: 'rect' as const, icon: '⬜', label: '矩形' },
    { type: 'circle' as const, icon: '⭕', label: '圆形' },
    { type: 'triangle' as const, icon: '🔺', label: '三角形' },
  ]

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-primary-dark/5 rounded-lg border border-primary-dark/10">
      {/* Add Image */}
      <button
        onClick={onAddImage}
        className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-primary-light rounded-lg hover:bg-primary-dark/90 transition-colors text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        图片
      </button>

      {/* Add Text */}
      <button
        onClick={onAddText}
        className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-primary-light rounded-lg hover:bg-primary-dark/90 transition-colors text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        文字
      </button>

      {/* Add Shape */}
      <div className="relative">
        <button
          onClick={() => setShowShapes(!showShapes)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-primary-light rounded-lg hover:bg-primary-dark/90 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          形状
        </button>
        {showShapes && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-primary-dark/10 p-2 z-10">
            {shapes.map((shape) => (
              <button
                key={shape.type}
                onClick={() => {
                  onAddShape(shape.type)
                  setShowShapes(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-primary-dark/5 rounded text-sm"
              >
                <span>{shape.icon}</span>
                <span>{shape.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex gap-1">
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-accent-red/10 text-accent-red rounded-lg hover:bg-accent-red/20 transition-colors text-sm"
          title="删除选中"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button
          onClick={onUndo}
          className="px-3 py-2 bg-primary-dark/10 text-primary-dark rounded-lg hover:bg-primary-dark/20 transition-colors text-sm"
          title="撤销"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={onClear}
          className="px-3 py-2 bg-primary-dark/10 text-primary-dark rounded-lg hover:bg-primary-dark/20 transition-colors text-sm"
          title="清空"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-accent-gold text-primary-dark rounded-lg hover:bg-accent-gold/90 transition-colors text-sm font-medium"
        >
          导出
        </button>
      </div>
    </div>
  )
}
