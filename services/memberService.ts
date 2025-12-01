import bcrypt from 'bcrypt'
import {
  createMember,
  findMemberById,
  findMemberByUsername,
  updateMember,
  createWallet,
  createTreeNode,
  findTreeNodeByMemberId,
} from '@/lib/db/helpers'
import mongoose from 'mongoose'

const SALT_ROUNDS = 10

export interface RegisterMemberInput {
  username: string
  password: string
  sponsorId?: string
}

export interface RegisterMemberResult {
  success: boolean
  member?: any
  error?: string
}

/**
 * Register a new member with sponsor assignment
 * Creates member account, initializes wallets, and positions in genealogy tree
 */
export async function registerMember(
  input: RegisterMemberInput
): Promise<RegisterMemberResult> {
  try {
    const { username, password, sponsorId } = input

    // Validate username
    if (!username || username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' }
    }

    // Validate password
    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Password cannot be empty or whitespace only' }
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' }
    }

    // Check if username already exists
    const existingMember = await findMemberByUsername(username)
    if (existingMember) {
      return { success: false, error: 'Username already exists' }
    }

    // Validate sponsor if provided
    let validatedSponsorId: string | null = null
    let sponsorNode = null

    if (sponsorId) {
      if (!mongoose.Types.ObjectId.isValid(sponsorId)) {
        return { success: false, error: 'Invalid sponsor ID' }
      }

      const sponsor = await findMemberById(sponsorId)
      if (!sponsor) {
        return { success: false, error: 'Sponsor not found' }
      }

      sponsorNode = await findTreeNodeByMemberId(sponsorId)
      if (!sponsorNode) {
        return { success: false, error: 'Sponsor not in genealogy tree' }
      }

      validatedSponsorId = sponsorId
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // Create member
    const member = await createMember({
      username,
      passwordHash,
      sponsorId: validatedSponsorId,
    })

    const memberId = member._id.toString()

    // Initialize both wallets with zero balance
    await createWallet({
      memberId,
      type: 'main',
      balance: 0,
    })

    await createWallet({
      memberId,
      type: 'commission',
      balance: 0,
    })

    // Position in genealogy tree
    let position: 'root' | 'left' | 'right' = 'root'
    let depth = 0

    if (sponsorNode) {
      // Determine position (left or right)
      if (!sponsorNode.leftChildId) {
        position = 'left'
        // Update sponsor's left child
        ;(sponsorNode as any).leftChildId = new mongoose.Types.ObjectId(memberId)
        await sponsorNode.save()
      } else if (!sponsorNode.rightChildId) {
        position = 'right'
        // Update sponsor's right child
        ;(sponsorNode as any).rightChildId = new mongoose.Types.ObjectId(memberId)
        await sponsorNode.save()
      } else {
        // Both positions filled, find next available position (spillover)
        const nextPosition = await findNextAvailablePosition(sponsorId!)
        if (nextPosition) {
          validatedSponsorId = nextPosition.sponsorId
          position = nextPosition.position
          depth = nextPosition.depth
        }
      }
      depth = (sponsorNode.depth || 0) + 1
    }

    // Create tree node
    await createTreeNode({
      memberId,
      sponsorId: validatedSponsorId,
      position,
      depth,
    })

    return {
      success: true,
      member: {
        id: memberId,
        username: member.username,
        sponsorId: validatedSponsorId,
        status: member.status,
        registrationDate: member.registrationDate,
      },
    }
  } catch (error: any) {
    console.error('Error registering member:', error)
    return { success: false, error: error.message || 'Registration failed' }
  }
}

/**
 * Find next available position in the binary tree (spillover logic)
 */
async function findNextAvailablePosition(sponsorId: string): Promise<{
  sponsorId: string
  position: 'left' | 'right'
  depth: number
} | null> {
  // BFS to find first node with available position
  const queue = [sponsorId]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const currentId = queue.shift()!
    if (visited.has(currentId)) continue
    visited.add(currentId)

    const node = await findTreeNodeByMemberId(currentId)
    if (!node) continue

    // Check if left position is available
    if (!node.leftChildId) {
      return {
        sponsorId: currentId,
        position: 'left',
        depth: (node.depth || 0) + 1,
      }
    }

    // Check if right position is available
    if (!node.rightChildId) {
      return {
        sponsorId: currentId,
        position: 'right',
        depth: (node.depth || 0) + 1,
      }
    }

    // Add children to queue
    if (node.leftChildId) queue.push(node.leftChildId.toString())
    if (node.rightChildId) queue.push(node.rightChildId.toString())
  }

  return null
}

/**
 * Authenticate member with username and password
 */
export async function authenticateMember(
  username: string,
  password: string
): Promise<{ success: boolean; member?: any; error?: string }> {
  try {
    const member = await findMemberByUsername(username)
    if (!member) {
      return { success: false, error: 'Invalid credentials' }
    }

    const isValid = await bcrypt.compare(password, member.passwordHash)
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' }
    }

    if (member.status !== 'active') {
      return { success: false, error: 'Account is not active' }
    }

    return {
      success: true,
      member: {
        id: member._id.toString(),
        username: member.username,
        status: member.status,
        sponsorId: member.sponsorId?.toString(),
        activePackageId: member.activePackageId?.toString(),
      },
    }
  } catch (error: any) {
    console.error('Error authenticating member:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Get member by ID
 */
export async function getMember(memberId: string) {
  try {
    const member = await findMemberById(memberId)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    return {
      success: true,
      member: {
        id: member._id.toString(),
        username: member.username,
        status: member.status,
        sponsorId: member.sponsorId?.toString(),
        activePackageId: member.activePackageId?.toString(),
        registrationDate: member.registrationDate,
      },
    }
  } catch (error: any) {
    console.error('Error getting member:', error)
    return { success: false, error: 'Failed to get member' }
  }
}

/**
 * Update member information
 */
export async function updateMemberInfo(
  memberId: string,
  updates: { status?: 'active' | 'inactive' | 'suspended'; activePackageId?: string }
) {
  try {
    const member = await updateMember(memberId, updates)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    return {
      success: true,
      member: {
        id: member._id.toString(),
        username: member.username,
        status: member.status,
        activePackageId: member.activePackageId?.toString(),
      },
    }
  } catch (error: any) {
    console.error('Error updating member:', error)
    return { success: false, error: 'Failed to update member' }
  }
}
