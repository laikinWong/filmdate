'use client'

import { filters } from '@/lib/filters'

interface FilterSelectorProps {
  selectedFilter: string
  onSelect: (filterId: string) => void
}

export default function FilterSelector({ selectedFilter, onSelect }: FilterSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onSelect(filter.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
            selectedFilter === filter.id
              ? 'bg-primary-dark text-primary-light shadow-lg'
              : 'bg-primary-dark/10 text-primary-dark hover:bg-primary-dark/20'
          }`}
        >
          {filter.name}
        </button>
      ))}
    </div>
  )
}
