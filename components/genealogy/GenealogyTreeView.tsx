'use client'

import React, { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { TreeNodeWithMember } from '@/services/genealogyService'
import MemberNode from './MemberNode'
import MemberInfoCard from './MemberInfoCard'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface GenealogyTreeViewProps {
  treeData: TreeNodeWithMember[]
  onNodeClick?: (memberId: string) => void
  onViewDownline?: (memberId: string) => void
  rootMemberId: string
}

const nodeTypes = {
  memberNode: MemberNode,
}

export default function GenealogyTreeView({
  treeData,
  onNodeClick,
  onViewDownline,
  rootMemberId,
}: GenealogyTreeViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedMember, setSelectedMember] = useState<TreeNodeWithMember | null>(null)
  const [isInfoCardOpen, setIsInfoCardOpen] = useState(false)

  // Convert tree data to React Flow nodes and edges
  useEffect(() => {
    if (!treeData || treeData.length === 0) return

    const flowNodes: Node[] = []
    const flowEdges: Edge[] = []
    const nodePositions = new Map<string, { x: number; y: number }>()

    // Calculate positions using a binary tree layout
    const calculatePosition = (
      memberId: string,
      depth: number,
      position: 'root' | 'left' | 'right',
      parentX: number = 0
    ): { x: number; y: number } => {
      const verticalSpacing = 150
      const horizontalSpacing = 200

      let x = parentX
      const y = depth * verticalSpacing

      if (position === 'left') {
        x = parentX - horizontalSpacing / Math.pow(2, depth - 1)
      } else if (position === 'right') {
        x = parentX + horizontalSpacing / Math.pow(2, depth - 1)
      }

      return { x, y }
    }

    // Build a map of nodes for quick lookup
    const nodeMap = new Map<string, TreeNodeWithMember>()
    treeData.forEach((node) => {
      nodeMap.set(node.memberId, node)
    })

    // BFS to calculate positions
    const queue: Array<{ memberId: string; parentX: number }> = [
      { memberId: rootMemberId, parentX: 0 },
    ]
    const visited = new Set<string>()

    while (queue.length > 0) {
      const { memberId, parentX } = queue.shift()!
      if (visited.has(memberId)) continue
      visited.add(memberId)

      const node = nodeMap.get(memberId)
      if (!node) continue

      const pos = calculatePosition(memberId, node.depth, node.position, parentX)
      nodePositions.set(memberId, pos)

      // Add children to queue
      if (node.leftChildId) {
        queue.push({ memberId: node.leftChildId, parentX: pos.x })
      }
      if (node.rightChildId) {
        queue.push({ memberId: node.rightChildId, parentX: pos.x })
      }
    }

    // Create React Flow nodes
    treeData.forEach((node) => {
      const pos = nodePositions.get(node.memberId) || { x: 0, y: 0 }

      flowNodes.push({
        id: node.memberId,
        type: 'memberNode',
        position: pos,
        data: {
          username: node.member?.username || 'Unknown',
          status: node.member?.status || 'inactive',
          activePackageId: node.member?.activePackageId,
          position: node.position,
          leftChildId: node.leftChildId,
          rightChildId: node.rightChildId,
          onClick: () => {
            setSelectedMember(node)
            setIsInfoCardOpen(true)
            onNodeClick?.(node.memberId)
          },
        },
      })

      // Create edges from parent to children
      if (node.leftChildId) {
        flowEdges.push({
          id: `${node.memberId}-left-${node.leftChildId}`,
          source: node.memberId,
          target: node.leftChildId,
          type: 'smoothstep',
          animated: true,
          label: 'L',
          labelStyle: { fill: '#3b82f6', fontWeight: 700 },
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
          },
        })
      }

      if (node.rightChildId) {
        flowEdges.push({
          id: `${node.memberId}-right-${node.rightChildId}`,
          source: node.memberId,
          target: node.rightChildId,
          type: 'smoothstep',
          animated: true,
          label: 'R',
          labelStyle: { fill: '#10b981', fontWeight: 700 },
          style: { stroke: '#10b981', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#10b981',
          },
        })
      }
    })

    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [treeData, rootMemberId, onNodeClick, setNodes, setEdges])

  return (
    <>
      <div className="w-full h-[600px] border rounded-lg bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background />
          <Controls />
          <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-md">
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-1 text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Left Leg</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Right Leg</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Member Info Card */}
      <MemberInfoCard
        member={selectedMember}
        isOpen={isInfoCardOpen}
        onClose={() => setIsInfoCardOpen(false)}
        onViewDownline={onViewDownline}
      />
    </>
  )
}
