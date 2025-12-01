'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, ArrowDown, TrendingUp, Package } from 'lucide-react'
import { TreeNodeWithMember } from '@/services/genealogyService'

interface MemberInfoCardProps {
  member: TreeNodeWithMember | null
  isOpen: boolean
  onClose: () => void
  onViewDownline?: (memberId: string) => void
  onViewProfile?: (memberId: string) => void
}

export default function MemberInfoCard({
  member,
  isOpen,
  onClose,
  onViewDownline,
  onViewProfile,
}: MemberInfoCardProps) {
  if (!member) return null

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

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

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'root':
        return 'Root'
      case 'left':
        return 'Left Leg'
      case 'right':
        return 'Right Leg'
      default:
        return position
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
          <DialogDescription>View detailed information about this member</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Member Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback
                className={`${getStatusColor(member.member?.status || 'inactive')} text-white text-lg`}
              >
                {getInitials(member.member?.username || 'Unknown')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{member.member?.username || 'Unknown'}</h3>
              <p className="text-sm text-gray-500">ID: {member.memberId.slice(-8)}</p>
              <Badge variant={getStatusBadgeVariant(member.member?.status || 'inactive')}>
                {member.member?.status || 'inactive'}
              </Badge>
            </div>
          </div>

          {/* Position Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Position Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium">{getPositionLabel(member.position)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tree Depth:</span>
                <span className="font-medium">Level {member.depth}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Has Left Child:</span>
                <span className="font-medium">{member.leftChildId ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Has Right Child:</span>
                <span className="font-medium">{member.rightChildId ? 'Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Leg Volumes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Leg Volumes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-600 font-medium">Left Leg Volume:</span>
                  <span className="font-semibold">${member.leftLegVolume.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (member.leftLegVolume / (member.leftLegVolume + member.rightLegVolume || 1)) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-600 font-medium">Right Leg Volume:</span>
                  <span className="font-semibold">${member.rightLegVolume.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (member.rightLegVolume / (member.leftLegVolume + member.rightLegVolume || 1)) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Volume:</span>
                  <span className="font-semibold">
                    ${(member.leftLegVolume + member.rightLegVolume).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Package */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Active Package
              </CardTitle>
            </CardHeader>
            <CardContent>
              {member.member?.activePackageId ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Package Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-500">No Active Package</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-2">
            {onViewDownline && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onViewDownline(member.memberId)
                  onClose()
                }}
              >
                <ArrowDown className="h-4 w-4 mr-2" />
                View Downline
              </Button>
            )}
            {onViewProfile && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onViewProfile(member.memberId)
                  onClose()
                }}
              >
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
