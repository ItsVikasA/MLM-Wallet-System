'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { 
  User, 
  Calendar, 
  Users, 
  ShoppingBag, 
  UserCheck,
  Settings,
  Upload
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface ProfileData {
  member: {
    id: string
    username: string
    status: 'active' | 'inactive' | 'suspended'
    registrationDate: string
    sponsorId?: string
    activePackageId?: string
  }
  sponsor: {
    id: string
    username: string
  } | null
  statistics: {
    totalDownline: number
    totalPurchases: number
  }
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load profile</p>
            <Button onClick={fetchProfile} className="mt-4">
              Retry
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground">
                Manage your account information and view your statistics
              </p>
            </div>
            <Link href="/settings">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-24 w-24">
                    <div className="h-full w-full rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  </Avatar>
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>

                {/* Member Details */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Username */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Username</span>
                      </div>
                      <p className="text-lg font-semibold">{profile.member.username}</p>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserCheck className="h-4 w-4" />
                        <span>Status</span>
                      </div>
                      <Badge className={getStatusColor(profile.member.status)}>
                        {profile.member.status.charAt(0).toUpperCase() + profile.member.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Registration Date */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Member Since</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {format(new Date(profile.member.registrationDate), 'MMMM dd, yyyy')}
                      </p>
                    </div>

                    {/* Member ID */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Member ID</span>
                      </div>
                      <p className="text-sm font-mono text-muted-foreground">
                        {profile.member.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sponsor Information */}
          {profile.sponsor && (
            <Card>
              <CardHeader>
                <CardTitle>Sponsor Information</CardTitle>
                <CardDescription>The member who referred you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{profile.sponsor.username}</p>
                      <p className="text-sm text-muted-foreground">Sponsor</p>
                    </div>
                  </div>
                  <Link href={`/genealogy?memberId=${profile.sponsor.id}`}>
                    <Button variant="outline" size="sm">
                      View in Tree
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Total Downline */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Downline</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{profile.statistics.totalDownline}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Members in your network
                </p>
                <Link href="/genealogy">
                  <Button variant="link" className="px-0 mt-2" size="sm">
                    View Genealogy Tree
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Total Purchases */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{profile.statistics.totalPurchases}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Packages purchased
                </p>
                <Link href="/packages">
                  <Button variant="link" className="px-0 mt-2" size="sm">
                    Browse Packages
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
