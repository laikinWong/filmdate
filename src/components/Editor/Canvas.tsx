'use client'

import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import * as fabric from 'fabric'

type TextOptions = NonNullable<ConstructorParameters<typeof fabric.IText>[1]>

export interface CanvasControls {
  addImage: (url: string) => Promise<void>
  addText: (text: string, options?: TextOptions) => void
  addShape: (type: 'rect' | 'circle' | 'triangle') => void
  deleteSelected: () => void
  undo: () => void
  clear: () => void
  exportImage: () => string | null
  getCanvas: () => fabric.Canvas | null
}

interface CanvasProps {
  width: number
  height: number
  onCanvasReady?: (controls: CanvasControls) => void
}

export default function Canvas({ width, height, onCanvasReady }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#F5E6D3',
      preserveObjectStacking: true,
    })

    fabricRef.current = canvas
    setIsReady(true)

    return () => {
      canvas.dispose()
      fabricRef.current = null
    }
  }, [width, height])

  const addImage = useCallback(async (url: string) => {
    const canvas = fabricRef.current
    if (!canvas) return

    try {
      const img = await fabric.FabricImage.fromURL(url, {
        crossOrigin: 'anonymous',
      })
      
      // Scale to fit canvas
      const maxWidth = canvas.width! * 0.8
      const maxHeight = canvas.height! * 0.8
      const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!)
      
      img.scale(scale)
      img.set({
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        originX: 'center',
        originY: 'center',
      })
      
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    } catch (err) {
      console.error('Failed to add image:', err)
    }
  }, [])

  const addText = useCallback((text: string, options?: TextOptions) => {
    const canvas = fabricRef.current
    if (!canvas) return

    const textObj = new fabric.IText(text, {
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Caveat, cursive',
      fontSize: 32,
      fill: '#2C1810',
      ...options,
    })

    canvas.add(textObj)
    canvas.setActiveObject(textObj)
    canvas.renderAll()
  }, [])

  const addShape = useCallback((type: 'rect' | 'circle' | 'triangle') => {
    const canvas = fabricRef.current
    if (!canvas) return

    let shape: fabric.FabricObject

    switch (type) {
      case 'rect':
        shape = new fabric.Rect({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: '#2C1810',
          strokeWidth: 2,
        })
        break
      case 'circle':
        shape = new fabric.Circle({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
          radius: 50,
          fill: 'transparent',
          stroke: '#2C1810',
          strokeWidth: 2,
        })
        break
      case 'triangle':
        shape = new fabric.Triangle({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: '#2C1810',
          strokeWidth: 2,
        })
        break
      default:
        return
    }

    canvas.add(shape)
    canvas.setActiveObject(shape)
    canvas.renderAll()
  }, [])

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => canvas.remove(obj))
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }, [])

  const undo = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    
    const objects = canvas.getObjects()
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1])
      canvas.renderAll()
    }
  }, [])

  const clear = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    
    canvas.clear()
    canvas.backgroundColor = '#F5E6D3'
    canvas.renderAll()
  }, [])

  const exportImage = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return null
    
    return canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    })
  }, [])

  const getCanvas = useCallback(() => {
    return fabricRef.current
  }, [])

  const controls = useMemo<CanvasControls>(() => ({
    addImage,
    addText,
    addShape,
    deleteSelected,
    undo,
    clear,
    exportImage,
    getCanvas,
  }), [addImage, addText, addShape, deleteSelected, undo, clear, exportImage, getCanvas])

  useEffect(() => {
    if (!isReady) return
    onCanvasReady?.(controls)
  }, [controls, isReady, onCanvasReady])

  return (
    <div className="relative border-4 border-primary-dark/20 rounded-lg overflow-hidden shadow-xl">
      <canvas ref={canvasRef} />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary-light/80">
          <div className="text-primary-dark/60">加载画布中...</div>
        </div>
      )}
    </div>
  )
}
