import mongoose from 'mongoose'
import {
  findTreeNodeByMemberId,
  findMemberById,
  updateTreeNode,
  getDownline as getDownlineHelper,
  getUpline as getUplineHelper,
} from '@/lib/db/helpers'
import TreeNodeModel from '@/models/TreeNode'
import MemberModel from '@/models/Member'

export interface TreePosition {
  sponsorId: string
  position: 'left' | 'right'
  depth: number
}

export interface TreeNodeWithMember {
  memberId: string
  sponsorId: string | null
  leftChildId: string | null
  rightChildId: string | null
  position: 'root' | 'left' | 'right'
  depth: number
  leftLegVolume: number
  rightLegVolume: number
  member?: {
    username: string
    status: 'active' | 'inactive' | 'suspended'
    activePackageId: string | null
  }
}

/**
 * Add a member to the genealogy tree
 * Finds next available position using binary tree placement (left-fill strategy)
 * Can handle explicit position assignment when specified
 */
export async function addMemberToTree(
  memberId: string,
  sponsorId: string,
  explicitPosition?: 'left' | 'right'
): Promise<{ success: boolean; treeNode?: any; error?: string }> {
  try {
    // Validate member exists
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    const member = await findMemberById(memberId)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    // Check if member already in tree
    const existingNode = await findTreeNodeByMemberId(memberId)
    if (existingNode) {
      return { success: false, error: 'Member already in tree' }
    }

    // Validate sponsor exists
    if (!mongoose.Types.ObjectId.isValid(sponsorId)) {
      return { success: false, error: 'Invalid sponsor ID' }
    }

    const sponsor = await findMemberById(sponsorId)
    if (!sponsor) {
      return { success: false, error: 'Sponsor not found' }
    }

    const sponsorNode = await findTreeNodeByMemberId(sponsorId)
    if (!sponsorNode) {
      return { success: false, error: 'Sponsor not in tree' }
    }

    // Determine position
    let position: 'left' | 'right'
    let actualSponsorId = sponsorId
    let depth = sponsorNode.depth + 1

    if (explicitPosition) {
      // Use explicit position if specified
      if (explicitPosition === 'left' && sponsorNode.leftChildId) {
        return { success: false, error: 'Left position already occupied' }
      }
      if (explicitPosition === 'right' && sponsorNode.rightChildId) {
        return { success: false, error: 'Right position already occupied' }
      }
      position = explicitPosition
    } else {
      // Find next available position using left-fill strategy
      const nextPosition = await findNextAvailablePosition(sponsorId)
      if (!nextPosition) {
        return { success: false, error: 'Could not find available position' }
      }
      actualSponsorId = nextPosition.sponsorId
      position = nextPosition.position
      depth = nextPosition.depth
    }

    // Create tree node
    const treeNode = await TreeNodeModel.create({
      memberId: new mongoose.Types.ObjectId(memberId),
      sponsorId: new mongoose.Types.ObjectId(actualSponsorId),
      position,
      depth,
      leftChildId: null,
      rightChildId: null,
      leftLegVolume: 0,
      rightLegVolume: 0,
    })

    // Update sponsor's child reference
    const actualSponsorNode: any = await findTreeNodeByMemberId(actualSponsorId)
    if (actualSponsorNode) {
      if (position === 'left') {
        actualSponsorNode.leftChildId = new mongoose.Types.ObjectId(memberId)
      } else {
        actualSponsorNode.rightChildId = new mongoose.Types.ObjectId(memberId)
      }
      await actualSponsorNode.save()
    }

    return {
      success: true,
      treeNode: {
        memberId: treeNode.memberId.toString(),
        sponsorId: treeNode.sponsorId?.toString(),
        position: treeNode.position,
        depth: treeNode.depth,
        leftChildId: treeNode.leftChildId?.toString(),
        rightChildId: treeNode.rightChildId?.toString(),
      },
    }
  } catch (error: any) {
    console.error('Error adding member to tree:', error)
    return { success: false, error: error.message || 'Failed to add member to tree' }
  }
}

/**
 * Find next available position in the binary tree using left-fill strategy
 * Uses breadth-first search to find the first node with an available position
 */
export async function findNextAvailablePosition(
  sponsorId: string
): Promise<TreePosition | null> {
  try {
    // BFS to find first node with available position
    const queue = [sponsorId]
    const visited = new Set<string>()

    while (queue.length > 0) {
      const currentId = queue.shift()!
      if (visited.has(currentId)) continue
      visited.add(currentId)

      const node = await findTreeNodeByMemberId(currentId)
      if (!node) continue

      // Check if left position is available (left-fill strategy)
      if (!node.leftChildId) {
        return {
          sponsorId: currentId,
          position: 'left',
          depth: node.depth + 1,
        }
      }

      // Check if right position is available
      if (!node.rightChildId) {
        return {
          sponsorId: currentId,
          position: 'right',
          depth: node.depth + 1,
        }
      }

      // Add children to queue for next level
      if (node.leftChildId) queue.push(node.leftChildId.toString())
      if (node.rightChildId) queue.push(node.rightChildId.toString())
    }

    return null
  } catch (error) {
    console.error('Error finding next available position:', error)
    return null
  }
}

/**
 * Get all downline members (descendants) in the genealogy tree
 * Retrieves complete subtree using breadth-first traversal
 * Supports depth limiting for performance optimization
 */
export async function getDownline(
  memberId: string,
  maxDepth?: number
): Promise<{ success: boolean; downline?: TreeNodeWithMember[]; error?: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    const member = await findMemberById(memberId)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    const rootNode = await findTreeNodeByMemberId(memberId)
    if (!rootNode) {
      return { success: false, error: 'Member not in tree' }
    }

    const downline: TreeNodeWithMember[] = []
    const queue: Array<{ id: string; depth: number }> = [{ id: memberId, depth: 0 }]
    const visited = new Set<string>()

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!

      // Skip if already visited
      if (visited.has(id)) continue
      visited.add(id)

      // Skip root node (we only want descendants)
      if (id !== memberId) {
        const node = await findTreeNodeByMemberId(id)
        if (node) {
          const nodeMember = await findMemberById(id)
          downline.push({
            memberId: node.memberId.toString(),
            sponsorId: node.sponsorId?.toString() || null,
            leftChildId: node.leftChildId?.toString() || null,
            rightChildId: node.rightChildId?.toString() || null,
            position: node.position,
            depth: node.depth,
            leftLegVolume: node.leftLegVolume,
            rightLegVolume: node.rightLegVolume,
            member: nodeMember
              ? {
                  username: nodeMember.username,
                  status: nodeMember.status,
                  activePackageId: nodeMember.activePackageId?.toString() || null,
                }
              : undefined,
          })
        }
      }

      // Check depth limit
      if (maxDepth !== undefined && depth >= maxDepth) {
        continue
      }

      // Add children to queue
      const node = await findTreeNodeByMemberId(id)
      if (node) {
        if (node.leftChildId) {
          queue.push({ id: node.leftChildId.toString(), depth: depth + 1 })
        }
        if (node.rightChildId) {
          queue.push({ id: node.rightChildId.toString(), depth: depth + 1 })
        }
      }
    }

    return { success: true, downline }
  } catch (error: any) {
    console.error('Error getting downline:', error)
    return { success: false, error: error.message || 'Failed to get downline' }
  }
}

/**
 * Get all upline members (ancestors) in the genealogy tree
 * Retrieves all sponsors up to the root
 */
export async function getUpline(
  memberId: string
): Promise<{ success: boolean; upline?: any[]; error?: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    const member = await findMemberById(memberId)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    const memberNode = await findTreeNodeByMemberId(memberId)
    if (!memberNode) {
      return { success: false, error: 'Member not in tree' }
    }

    const upline: any[] = []
    let currentId: string | null = memberNode.sponsorId?.toString() || null

    while (currentId) {
      const sponsor = await findMemberById(currentId)
      if (!sponsor) break

      const sponsorNode = await findTreeNodeByMemberId(currentId)
      if (!sponsorNode) break

      upline.push({
        id: sponsor._id.toString(),
        username: sponsor.username,
        status: sponsor.status,
        activePackageId: sponsor.activePackageId?.toString() || null,
        position: sponsorNode.position,
        depth: sponsorNode.depth,
      })

      currentId = sponsorNode.sponsorId?.toString() || null
    }

    return { success: true, upline }
  } catch (error: any) {
    console.error('Error getting upline:', error)
    return { success: false, error: error.message || 'Failed to get upline' }
  }
}

/**
 * Get genealogy tree with complete member information
 * Retrieves tree structure with member details (position, status, package)
 * Supports depth limiting for performance
 */
export async function getTreeWithMemberInfo(
  memberId: string,
  maxDepth?: number
): Promise<{ success: boolean; tree?: TreeNodeWithMember[]; error?: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    const member = await findMemberById(memberId)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    const rootNode = await findTreeNodeByMemberId(memberId)
    if (!rootNode) {
      return { success: false, error: 'Member not in tree' }
    }

    const tree: TreeNodeWithMember[] = []
    const queue: Array<{ id: string; depth: number }> = [{ id: memberId, depth: 0 }]
    const visited = new Set<string>()

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!

      // Skip if already visited
      if (visited.has(id)) continue
      visited.add(id)

      const node = await findTreeNodeByMemberId(id)
      if (!node) continue

      const nodeMember = await findMemberById(id)
      if (!nodeMember) continue

      // Add node with complete member information
      tree.push({
        memberId: node.memberId.toString(),
        sponsorId: node.sponsorId?.toString() || null,
        leftChildId: node.leftChildId?.toString() || null,
        rightChildId: node.rightChildId?.toString() || null,
        position: node.position,
        depth: node.depth,
        leftLegVolume: node.leftLegVolume,
        rightLegVolume: node.rightLegVolume,
        member: {
          username: nodeMember.username,
          status: nodeMember.status,
          activePackageId: nodeMember.activePackageId?.toString() || null,
        },
      })

      // Check depth limit
      if (maxDepth !== undefined && depth >= maxDepth) {
        continue
      }

      // Add children to queue
      if (node.leftChildId) {
        queue.push({ id: node.leftChildId.toString(), depth: depth + 1 })
      }
      if (node.rightChildId) {
        queue.push({ id: node.rightChildId.toString(), depth: depth + 1 })
      }
    }

    return { success: true, tree }
  } catch (error: any) {
    console.error('Error getting tree with member info:', error)
    return { success: false, error: error.message || 'Failed to get tree' }
  }
}
