'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User } from 'lucide-react'

interface MemberNodeData {
  username: string
  status: 'active' | 'inactive' | 'suspended'
  activePackageId: string | null
  position: 'root' | 'left' | 'right'
  leftChildId: string | null
  rightChildId: string | null
  onClick?: () => void
}

export default function MemberNode({ data }: { data: MemberNodeData }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-gray-500'
      case 'suspended':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'active':
        return 'default'
      case 'suspended':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className="bg-white border-2 border-gray-300 rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow cursor-pointer min-w-[160px]"
      onClick={data.onClick}
    >
      {/* Top handle for parent connection */}
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex flex-col items-center gap-2">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={`${getStatusColor(data.status)} text-white`}>
              {getInitials(data.username)}
            </AvatarFallback>
          </Avatar>
          {/* Position indicator */}
          {data.position !== 'root' && (
            <div
              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                data.position === 'left' ? 'bg-blue-500' : 'bg-green-500'
              }`}
            >
              {data.position === 'left' ? 'L' : 'R'}
            </div>
          )}
        </div>

        {/* Username */}
        <div className="text-sm font-semibold text-center truncate max-w-[140px]">
          {data.username}
        </div>

        {/* Status Badge */}
        <Badge variant={getStatusBadgeVariant(data.status)} className="text-xs">
          {data.status}
        </Badge>

        {/* Package indicator */}
        {data.activePackageId && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Active</span>
          </div>
        )}

        {/* Child indicators */}
        <div className="flex gap-2 text-xs text-gray-400">
          <div className={`flex items-center gap-1 ${data.leftChildId ? 'text-blue-500' : ''}`}>
            <span>L</span>
            {data.leftChildId && <span>✓</span>}
          </div>
          <div className={`flex items-center gap-1 ${data.rightChildId ? 'text-green-500' : ''}`}>
            <span>R</span>
            {data.rightChildId && <span>✓</span>}
          </div>
        </div>
      </div>

      {/* Bottom handles for children connections */}
      {data.position !== 'root' && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="left"
            className="w-3 h-3"
            style={{ left: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="right"
            className="w-3 h-3"
            style={{ left: '70%' }}
          />
        </>
      )}
      {data.position === 'root' && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="left"
            className="w-3 h-3"
            style={{ left: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="right"
            className="w-3 h-3"
            style={{ left: '70%' }}
          />
        </>
      )}
    </div>
  )
}
