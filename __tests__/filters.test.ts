import { filters, getFilterById, applyFilter } from '@/lib/filters'

describe('Filters', () => {
  it('should have 8 filter presets', () => {
    expect(filters).toHaveLength(8)
  })

  it('should have correct filter properties', () => {
    filters.forEach(filter => {
      expect(filter).toHaveProperty('id')
      expect(filter).toHaveProperty('name')
      expect(filter).toHaveProperty('description')
      expect(filter).toHaveProperty('apply')
      expect(typeof filter.apply).toBe('function')
    })
  })

  it('should find filter by id', () => {
    const filter = getFilterById('kodak-portra')
    expect(filter).toBeDefined()
    expect(filter?.name).toBe('柯达 Portra')
  })

  it('should return undefined for unknown filter id', () => {
    const filter = getFilterById('unknown-filter')
    expect(filter).toBeUndefined()
  })

  it('should have unique filter ids', () => {
    const ids = filters.map(f => f.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})
