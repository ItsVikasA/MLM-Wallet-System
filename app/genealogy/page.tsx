'use client'

import React, { useEffect, useState, lazy, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import TreeNavigationControls from '@/components/genealogy/TreeNavigationControls'

// Lazy load the heavy tree visualization component
const GenealogyTreeView = lazy(() => import('@/components/genealogy/GenealogyTreeView'))
import { TreeNodeWithMember } from '@/services/genealogyService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function GenealogyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [treeData, setTreeData] = useState<TreeNodeWithMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMemberId, setCurrentMemberId] = useState<string>('')
  const [currentUsername, setCurrentUsername] = useState<string>('')
  const [maxDepth, setMaxDepth] = useState(3)
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; username: string }>>([])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch tree data
  const fetchTreeData = async (memberId?: string, depth?: number) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (memberId) params.append('memberId', memberId)
      if (depth !== undefined) params.append('maxDepth', depth.toString())

      const response = await fetch(`/api/genealogy/tree?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tree data')
      }

      setTreeData(data.tree || [])

      // Set current member info from root of tree
      if (data.tree && data.tree.length > 0) {
        const rootNode = data.tree[0]
        setCurrentMemberId(rootNode.memberId)
        setCurrentUsername(rootNode.member?.username || 'Unknown')
      }
    } catch (err: any) {
      console.error('Error fetching tree:', err)
      setError(err.message || 'Failed to load genealogy tree')
      toast.error(err.message || 'Failed to load genealogy tree')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    if (session?.user?.id) {
      setCurrentMemberId(session.user.id)
      fetchTreeData(session.user.id, maxDepth)
    }
  }, [session?.user?.id])

  // Handle view upline
  const handleViewUpline = async () => {
    try {
      const response = await fetch(`/api/genealogy/upline?memberId=${currentMemberId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch upline')
      }

      if (data.upline && data.upline.length > 0) {
        const sponsor = data.upline[0]
        setCurrentMemberId(sponsor.id)
        setCurrentUsername(sponsor.username)
        fetchTreeData(sponsor.id, maxDepth)
        toast.success(`Viewing ${sponsor.username}'s tree`)
      } else {
        toast.info('No upline members found')
      }
    } catch (err: any) {
      console.error('Error fetching upline:', err)
      toast.error(err.message || 'Failed to fetch upline')
    }
  }

  // Handle view downline
  const handleViewDownline = (memberId: string) => {
    const member = treeData.find((node) => node.memberId === memberId)
    if (member) {
      setCurrentMemberId(memberId)
      setCurrentUsername(member.member?.username || 'Unknown')
      fetchTreeData(memberId, maxDepth)

      // Update breadcrumbs
      setBreadcrumbs([...breadcrumbs, { id: memberId, username: member.member?.username || 'Unknown' }])
      toast.success(`Viewing ${member.member?.username || 'Unknown'}'s downline`)
    }
  }

  // Handle search
  const handleSearch = async (query: string) => {
    try {
      // Search within current tree data
      const found = treeData.find((node) =>
        node.member?.username.toLowerCase().includes(query.toLowerCase())
      )

      if (found) {
        setCurrentMemberId(found.memberId)
        setCurrentUsername(found.member?.username || 'Unknown')
        fetchTreeData(found.memberId, maxDepth)
        toast.success(`Found: ${found.member?.username}`)
      } else {
        toast.error('Member not found in current tree view')
      }
    } catch (err: any) {
      console.error('Error searching:', err)
      toast.error('Search failed')
    }
  }

  // Handle depth change
  const handleDepthChange = (depth: number) => {
    setMaxDepth(depth)
    fetchTreeData(currentMemberId, depth)
  }

  // Handle go to root
  const handleGoToRoot = () => {
    if (session?.user?.id) {
      setCurrentMemberId(session.user.id)
      setCurrentUsername(session.user.name || 'You')
      setBreadcrumbs([])
      fetchTreeData(session.user.id, maxDepth)
      toast.success('Returned to your tree')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Genealogy Tree</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Controls */}
          <TreeNavigationControls
            currentMemberId={currentMemberId}
            currentUsername={currentUsername}
            onViewUpline={handleViewUpline}
            onViewDownline={handleViewDownline}
            onSearch={handleSearch}
            onDepthChange={handleDepthChange}
            onGoToRoot={handleGoToRoot}
            breadcrumbs={breadcrumbs}
            maxDepth={maxDepth}
          />

          {/* Tree Visualization */}
          {treeData.length > 0 ? (
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-muted-foreground">Loading tree visualization...</span>
              </div>
            }>
              <GenealogyTreeView
                treeData={treeData}
                rootMemberId={currentMemberId}
                onViewDownline={handleViewDownline}
              />
            </Suspense>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No tree data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
