export interface FilterPreset {
  id: string
  name: string
  description: string
  apply: (ctx: CanvasRenderingContext2D, imageData: ImageData) => ImageData
}

export const filters: FilterPreset[] = [
  {
    id: 'kodak-portra',
    name: '柯达 Portra',
    description: '温暖柔和的肤色',
    apply: (ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.1 + 10)     // R
        data[i + 1] = Math.min(255, data[i + 1] * 1.05)  // G
        data[i + 2] = Math.max(0, data[i + 2] * 0.9)     // B
      }
      return imageData
    },
  },
  {
    id: 'fuji-velvia',
    name: '富士 Velvia',
    description: '鲜艳饱和的色彩',
    apply: (ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.2)      // R
        data[i + 1] = Math.min(255, data[i + 1] * 1.15) // G
        data[i + 2] = Math.min(255, data[i + 2] * 1.1)  // B
      }
      return imageData
    },
  },
  {
    id: 'polaroid',
    name: '宝丽来',
    description: '复古即时成像风格',
    apply: (ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        // Fade effect
        data[i] = Math.min(255, data[i] * 0.9 + 30)
        data[i + 1] = Math.min(255, data[i + 1] * 0.85 + 25)
        data[i + 2] = Math.min(255, data[i + 2] * 0.8 + 20)
      }
      return imageData
    },
  },
  {
    id: 'ilford-hp5',
    name: 'Ilford HP5',
    description: '经典黑白胶片',
    apply: (ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
        data[i] = avg
        data[i + 1] = avg
        data[i + 2] = avg
      }
      return imageData
    },
  },
  {
    id: 'kodak-gold',
    name: '柯达 Gold',
    description: '温暖金色调',
    apply: (ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.1 + 15)
        data[i + 1] = Math.min(255, data[i + 1] * 1.05 + 10)
        data[i + 2] = Math.max(0, data[i + 2] * 0.85)
      }
      return imageData
    },
  },
  {
    id: 'cinestill-800',
    name: 'CineStill 800T',
    description: '电影胶片风格',
    apply: (ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        // Tungsten balance with slight blue shift
        data[i] = Math.min(255, data[i] * 1.05)
        data[i + 1] = Math.min(255, data[i + 1] * 1.0)
        data[i + 2] = Math.min(255, data[i + 2] * 1.15 + 5)
      }
      return imageData
    },
  },
  {
    id: 'agfa-vista',
    name: 'Agfa Vista',
    description: '复古暖色调',
    apply: (ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.15 + 8)
        data[i + 1] = Math.min(255, data[i + 1] * 1.08 + 5)
        data[i + 2] = Math.max(0, data[i + 2] * 0.88)
      }
      return imageData
    },
  },
  {
    id: 'fujifilm-superia',
    name: '富士 Superia',
    description: '自然绿色调',
    apply: (ctx, imageData) => {
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.05)
        data[i + 1] = Math.min(255, data[i + 1] * 1.12 + 3)
        data[i + 2] = Math.min(255, data[i + 2] * 1.05)
      }
      return imageData
    },
  },
]

export function getFilterById(id: string): FilterPreset | undefined {
  return filters.find(f => f.id === id)
}

export function applyFilter(
  canvas: HTMLCanvasElement,
  filterId: string,
  intensity: number = 1
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const filter = filters.find(f => f.id === filterId)
  if (!filter) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const filteredData = filter.apply(ctx, imageData)

  // Apply intensity
  if (intensity < 1) {
    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < filteredData.data.length; i += 4) {
      filteredData.data[i] = originalData.data[i] + (filteredData.data[i] - originalData.data[i]) * intensity
      filteredData.data[i + 1] = originalData.data[i + 1] + (filteredData.data[i + 1] - originalData.data[i + 1]) * intensity
      filteredData.data[i + 2] = originalData.data[i + 2] + (filteredData.data[i + 2] - originalData.data[i + 2]) * intensity
    }
  }

  ctx.putImageData(filteredData, 0, 0)
}

export function addFilmGrain(canvas: HTMLCanvasElement, intensity: number = 0.1): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 255 * intensity
    data[i] = Math.max(0, Math.min(255, data[i] + noise))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
  }

  ctx.putImageData(imageData, 0, 0)
}

export function addVignette(canvas: HTMLCanvasElement, intensity: number = 0.3): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.max(width, height) / 2

  const gradient = ctx.createRadialGradient(
    centerX, centerY, radius * 0.5,
    centerX, centerY, radius
  )
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, `rgba(0,0,0,${intensity})`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}
