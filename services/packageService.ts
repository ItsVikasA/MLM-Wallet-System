import mongoose from 'mongoose'
import {
  findAllPackages,
  findPackageById,
  findActivePackages,
  findMemberById,
  updateMember,
  findWalletByMemberIdAndType,
  updateWalletBalance,
  createTransaction,
} from '@/lib/db/helpers'
import { calculateCommissions } from './commissionService'

/**
 * Get all available packages
 */
export async function getAvailablePackages(): Promise<{
  success: boolean
  packages?: any[]
  error?: string
}> {
  try {
    const packages = await findActivePackages()
    return {
      success: true,
      packages: packages.map(pkg => ({
        id: pkg._id.toString(),
        name: pkg.name,
        price: pkg.price,
        commissionRate: pkg.commissionRate,
        description: pkg.description,
        isActive: pkg.isActive,
      })),
    }
  } catch (error: any) {
    console.error('Error getting available packages:', error)
    return { success: false, error: error.message || 'Failed to get packages' }
  }
}

/**
 * Get active package for a member
 */
export async function getActivePackage(
  memberId: string
): Promise<{ success: boolean; package?: any; error?: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    const member = await findMemberById(memberId)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    if (!member.activePackageId) {
      return { success: true, package: null }
    }

    const pkg = await findPackageById(member.activePackageId.toString())
    if (!pkg) {
      return { success: true, package: null }
    }

    return {
      success: true,
      package: {
        id: pkg._id.toString(),
        name: pkg.name,
        price: pkg.price,
        commissionRate: pkg.commissionRate,
        description: pkg.description,
        isActive: pkg.isActive,
      },
    }
  } catch (error: any) {
    console.error('Error getting active package:', error)
    return { success: false, error: error.message || 'Failed to get active package' }
  }
}

/**
 * Purchase a package
 * Validates balance, deducts from main wallet, updates active package
 * Triggers commission calculations after successful purchase
 */
export async function purchasePackage(
  memberId: string,
  packageId: string
): Promise<{ success: boolean; purchase?: any; error?: string }> {
  try {
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return { success: false, error: 'Invalid package ID' }
    }

    // Get member
    const member = await findMemberById(memberId)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    // Get package
    const pkg = await findPackageById(packageId)
    if (!pkg) {
      return { success: false, error: 'Package not found' }
    }

    if (!pkg.isActive) {
      return { success: false, error: 'Package is not active' }
    }

    // Get main wallet
    const mainWallet = await findWalletByMemberIdAndType(memberId, 'main')
    if (!mainWallet) {
      return { success: false, error: 'Main wallet not found' }
    }

    // Validate sufficient balance
    if (mainWallet.balance < pkg.price) {
      return { success: false, error: 'Insufficient balance' }
    }

    // Deduct from main wallet
    const newBalance = mainWallet.balance - pkg.price
    await updateWalletBalance(memberId, 'main', newBalance)

    // Create purchase transaction
    await createTransaction({
      memberId,
      walletType: 'main',
      type: 'purchase',
      amount: pkg.price,
      balanceBefore: mainWallet.balance,
      balanceAfter: newBalance,
      description: `Package purchase: ${pkg.name}`,
    })

    // Update member's active package
    await updateMember(memberId, {
      activePackageId: new mongoose.Types.ObjectId(packageId),
    })

    // Trigger commission calculations for upline
    const commissionResult = await calculateCommissions(memberId, pkg.price, packageId)
    if (!commissionResult.success) {
      console.error('Commission calculation failed:', commissionResult.error)
      // Don't fail the purchase, just log the error
    }

    return {
      success: true,
      purchase: {
        memberId,
        packageId,
        packageName: pkg.name,
        amount: pkg.price,
        newBalance,
        commissionsDistributed: commissionResult.results?.length || 0,
      },
    }
  } catch (error: any) {
    console.error('Error purchasing package:', error)
    return { success: false, error: error.message || 'Failed to purchase package' }
  }
}
