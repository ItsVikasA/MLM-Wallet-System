import mongoose from 'mongoose'
import {
  findMemberById,
  findTreeNodeByMemberId,
  updateTreeNode,
  findWalletByMemberIdAndType,
  updateWalletBalance,
  createTransaction,
  findPackageById,
} from '@/lib/db/helpers'

export interface CommissionResult {
  memberId: string
  amount: number
  fromMemberId: string
  packageAmount: number
  leg: 'left' | 'right'
}

/**
 * Update leg volumes for a member based on a purchase
 * Tracks left and right leg sales separately
 * Determines which leg the purchase belongs to based on tree position
 */
export async function updateLegVolumes(
  memberId: string,
  purchaseAmount: number,
  purchaseMemberId: string
): Promise<{ success: boolean; leg?: 'left' | 'right'; error?: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    if (!mongoose.Types.ObjectId.isValid(purchaseMemberId)) {
      return { success: false, error: 'Invalid purchase member ID' }
    }

    if (purchaseAmount <= 0) {
      return { success: false, error: 'Purchase amount must be positive' }
    }

    const memberNode = await findTreeNodeByMemberId(memberId)
    if (!memberNode) {
      return { success: false, error: 'Member not in tree' }
    }

    const purchaseNode = await findTreeNodeByMemberId(purchaseMemberId)
    if (!purchaseNode) {
      return { success: false, error: 'Purchase member not in tree' }
    }

    // Determine which leg the purchase belongs to
    let leg: 'left' | 'right' | null = null

    // Check if purchase member is in left subtree
    if (await isInSubtree(memberNode.leftChildId?.toString() || null, purchaseMemberId)) {
      leg = 'left'
    }
    // Check if purchase member is in right subtree
    else if (await isInSubtree(memberNode.rightChildId?.toString() || null, purchaseMemberId)) {
      leg = 'right'
    }

    if (!leg) {
      return { success: false, error: 'Purchase member not in downline' }
    }

    // Update the appropriate leg volume
    if (leg === 'left') {
      memberNode.leftLegVolume += purchaseAmount
    } else {
      memberNode.rightLegVolume += purchaseAmount
    }

    await memberNode.save()

    return { success: true, leg }
  } catch (error: any) {
    console.error('Error updating leg volumes:', error)
    return { success: false, error: error.message || 'Failed to update leg volumes' }
  }
}

/**
 * Helper function to check if a member is in a subtree
 */
async function isInSubtree(rootId: string | null, targetId: string): Promise<boolean> {
  if (!rootId) return false
  if (rootId === targetId) return true

  const queue = [rootId]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const currentId = queue.shift()!
    if (visited.has(currentId)) continue
    visited.add(currentId)

    if (currentId === targetId) return true

    const node = await findTreeNodeByMemberId(currentId)
    if (node) {
      if (node.leftChildId) queue.push(node.leftChildId.toString())
      if (node.rightChildId) queue.push(node.rightChildId.toString())
    }
  }

  return false
}

/**
 * Get leg volumes for a member
 */
export async function getLegVolumes(
  memberId: string
): Promise<{ success: boolean; volumes?: { left: number; right: number }; error?: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    const memberNode = await findTreeNodeByMemberId(memberId)
    if (!memberNode) {
      return { success: false, error: 'Member not in tree' }
    }

    return {
      success: true,
      volumes: {
        left: memberNode.leftLegVolume,
        right: memberNode.rightLegVolume,
      },
    }
  } catch (error: any) {
    console.error('Error getting leg volumes:', error)
    return { success: false, error: error.message || 'Failed to get leg volumes' }
  }
}

/**
 * Process pairing for a member
 * Calculates commission from minimum leg volume
 * Deducts paired amounts from both leg volumes
 */
export async function processPairing(
  memberId: string,
  packageId: string
): Promise<{ success: boolean; commission?: number; error?: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return { success: false, error: 'Invalid package ID' }
    }

    const memberNode = await findTreeNodeByMemberId(memberId)
    if (!memberNode) {
      return { success: false, error: 'Member not in tree' }
    }

    const pkg = await findPackageById(packageId)
    if (!pkg) {
      return { success: false, error: 'Package not found' }
    }

    // Calculate pairing using minimum leg volume
    const minVolume = Math.min(memberNode.leftLegVolume, memberNode.rightLegVolume)

    if (minVolume <= 0) {
      return { success: true, commission: 0 }
    }

    // Calculate commission based on package rate
    const commission = minVolume * (pkg.commissionRate / 100)

    // Deduct paired amounts from both legs
    memberNode.leftLegVolume -= minVolume
    memberNode.rightLegVolume -= minVolume
    await memberNode.save()

    return { success: true, commission }
  } catch (error: any) {
    console.error('Error processing pairing:', error)
    return { success: false, error: error.message || 'Failed to process pairing' }
  }
}

/**
 * Calculate and distribute commissions to upline members
 * Credits commissions to commission wallet (not main wallet)
 * Processes commissions for all qualifying upline members
 */
export async function calculateCommissions(
  purchaseMemberId: string,
  packageAmount: number,
  packageId: string
): Promise<{ success: boolean; results?: CommissionResult[]; error?: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(purchaseMemberId)) {
      return { success: false, error: 'Invalid purchase member ID' }
    }

    if (packageAmount <= 0) {
      return { success: false, error: 'Package amount must be positive' }
    }

    const purchaseMember = await findMemberById(purchaseMemberId)
    if (!purchaseMember) {
      return { success: false, error: 'Purchase member not found' }
    }

    const purchaseNode = await findTreeNodeByMemberId(purchaseMemberId)
    if (!purchaseNode) {
      return { success: false, error: 'Purchase member not in tree' }
    }

    const results: CommissionResult[] = []

    // Traverse upline and update leg volumes
    let currentId: string | null = purchaseNode.sponsorId?.toString() || null

    while (currentId) {
      const uplineMember = await findMemberById(currentId)
      if (!uplineMember) break

      const uplineNode = await findTreeNodeByMemberId(currentId)
      if (!uplineNode) break

      // Update leg volumes for this upline member
      const updateResult = await updateLegVolumes(currentId, packageAmount, purchaseMemberId)
      if (!updateResult.success) {
        console.error(`Failed to update leg volumes for ${currentId}:`, updateResult.error)
        currentId = uplineNode.sponsorId?.toString() || null
        continue
      }

      // Check if member has active package
      if (uplineMember.activePackageId) {
        // Process pairing and calculate commission
        const pairingResult = await processPairing(currentId, uplineMember.activePackageId.toString())
        
        if (pairingResult.success && pairingResult.commission && pairingResult.commission > 0) {
          // Credit commission to commission wallet
          const wallet = await findWalletByMemberIdAndType(currentId, 'commission')
          if (wallet) {
            const newBalance = wallet.balance + pairingResult.commission
            await updateWalletBalance(currentId, 'commission', newBalance)

            // Create transaction record
            await createTransaction({
              memberId: currentId,
              walletType: 'commission',
              type: 'commission',
              amount: pairingResult.commission,
              balanceBefore: wallet.balance,
              balanceAfter: newBalance,
              description: `Binary commission from member ${purchaseMemberId}`,
              relatedMemberId: purchaseMemberId,
            })

            results.push({
              memberId: currentId,
              amount: pairingResult.commission,
              fromMemberId: purchaseMemberId,
              packageAmount,
              leg: updateResult.leg!,
            })
          }
        }
      }

      // Move to next upline member
      currentId = uplineNode.sponsorId?.toString() || null
    }

    return { success: true, results }
  } catch (error: any) {
    console.error('Error calculating commissions:', error)
    return { success: false, error: error.message || 'Failed to calculate commissions' }
  }
}
