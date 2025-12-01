'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ArrowUp, ArrowDown, Search, Home } from 'lucide-react'

interface TreeNavigationControlsProps {
  currentMemberId: string
  currentUsername: string
  onViewUpline: () => void
  onViewDownline: (memberId: string) => void
  onSearch: (query: string) => void
  onDepthChange: (depth: number) => void
  onGoToRoot: () => void
  breadcrumbs?: Array<{ id: string; username: string }>
  maxDepth: number
}

export default function TreeNavigationControls({
  currentMemberId,
  currentUsername,
  onViewUpline,
  onViewDownline,
  onSearch,
  onDepthChange,
  onGoToRoot,
  breadcrumbs = [],
  maxDepth,
}: TreeNavigationControlsProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoToRoot}
            className="flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
            <span>Root</span>
          </Button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <span className="text-gray-400">/</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDownline(crumb.id)}
                className={index === breadcrumbs.length - 1 ? 'font-semibold' : ''}
              >
                {crumb.username}
              </Button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewUpline}
            className="flex items-center gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            View Upline
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDownline(currentMemberId)}
            className="flex items-center gap-2"
          >
            <ArrowDown className="h-4 w-4" />
            View Downline
          </Button>
        </div>

        {/* Depth Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Depth:</label>
          <Select
            value={maxDepth.toString()}
            onChange={(e) => onDepthChange(parseInt(e.target.value))}
            className="w-[120px]"
          >
            <option value="2">2 Levels</option>
            <option value="3">3 Levels</option>
            <option value="4">4 Levels</option>
            <option value="5">5 Levels</option>
            <option value="10">10 Levels</option>
            <option value="999">All</option>
          </Select>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <Input
            type="text"
            placeholder="Search member by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>
      </div>

      {/* Current View Info */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <span className="font-medium">Current View:</span> {currentUsername} (
        {currentMemberId.slice(-8)})
      </div>
    </div>
  )
}
