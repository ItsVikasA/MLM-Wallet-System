import { connectDB } from './connection'
import MemberModel from '@/models/Member'
import WalletModel from '@/models/Wallet'
import TransactionModel from '@/models/Transaction'
import TreeNodeModel from '@/models/TreeNode'
import PackageModel from '@/models/Package'
import mongoose from 'mongoose'

// Member helpers
export async function createMember(data: {
  username: string
  passwordHash: string
  sponsorId?: string | null
}) {
  await connectDB()
  const member = await MemberModel.create(data)
  return member
}

export async function findMemberById(id: string) {
  await connectDB()
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return await MemberModel.findById(id)
}

export async function findMemberByUsername(username: string) {
  await connectDB()
  return await MemberModel.findOne({ username })
}

export async function updateMember(id: string, updates: any) {
  await connectDB()
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return await MemberModel.findByIdAndUpdate(id, updates, { new: true })
}

// Wallet helpers
export async function createWallet(data: {
  memberId: string
  type: 'main' | 'commission'
  balance?: number
}) {
  await connectDB()
  const wallet = await WalletModel.create(data)
  return wallet
}

export async function findWalletsByMemberId(memberId: string) {
  await connectDB()
  if (!mongoose.Types.ObjectId.isValid(memberId)) return []
  return await WalletModel.find({ memberId })
}

export async function findWalletByMemberIdAndType(
  memberId: string,
  type: 'main' | 'commission'
) {
  await connectDB()
  if (!mongoose.Types.ObjectId.isValid(memberId)) return null
  return await WalletModel.findOne({ memberId, type })
}

export async function updateWalletBalance(
  memberId: string,
  type: 'main' | 'commission',
  newBalance: number
) {
  await connectDB()
  if (!mongoose.Types.ObjectId.isValid(memberId)) return null
  return await WalletModel.findOneAndUpdate(
    { memberId, type },
    { balance: newBalance, lastUpdated: new Date() },
    { new: true }
  )
}

// Transaction helpers
export async function createTransaction(data: {
  memberId: string
  walletType: 'main' | 'commission'
  type: 'deposit' | 'purchase' | 'commission' | 'withdrawal'
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string
  relatedMemberId?: string
}) {
  await connectDB()
  const transaction = await TransactionModel.create(data)
  return transaction
}

export async function findTransactionsByMemberId(memberId: string) {
  await connectDB()
  if (!mongoose.Types.ObjectId.isValid(memberId)) return []
  return await TransactionModel.find({ memberId }).sort({ timestamp: -1 })
}

export async function findTransactionsByFilters(filters: {
  memberId: string
  walletType?: 'main' | 'commission'
  type?: 'deposit' | 'purchase' | 'commission' | 'withdrawal'
  startDate?: Date
  endDate?: Date
}) {
  await connectDB()
  if (!mongoose.Types.ObjectId.isValid(filters.memberId)) return []
  
  const query: any = { memberId: filters.memberId }
  
  if (filters.walletType) {
    query.walletType = filters.walletType
  }
  
  if (filters.type) {
    query.type = filters.type
  }
  
  if (filters.startDate || filters.endDate) {
    query.timestamp = {}
    if (filters.startDate) {
      query.timestamp.$gte = filters.startDate
    }
    if (filters.endDate) {
      query.timestamp.$lte = filters.endDate
    }
  }
  
  return await TransactionModel.find(query).sort({ timestamp: -1 })
}

// TreeNode helpers
export async function createTreeNode(data: {
  memberId: string
  sponsorId?: string | null
  position: 'root' | 'left' | 'right'
  depth: number
}) {
  await connectDB()
  const treeNode = await TreeNodeModel.create(data)
  return treeNode
}

export async function findTreeNodeByMemberId(memberId: string) {
  await connectDB()
  if (!mongoose.Types.ObjectId.isValid(memberId)) return null
  return await TreeNodeModel.findOne({ memberId })
}

export async function getDownline(memberId: string) {
  await connectDB()
  if (!mongoose.Types.ObjectId.isValid(memberId)) return []
  
  const downline: any[] = []
  const queue = [memberId]
  
  while (queue.length > 0) {
    const currentId = queue.shift()!
    const node = await TreeNodeModel.findOne({ memberId: currentId })
    
    if (node) {
      downline.push(node)
      if (node.leftChildId) queue.push(node.leftChildId.toString())
      if (node.rightChildId) queue.push(node.rightChildId.toString())
    }
  }
  
  return downline
}

export async function getUpline(memberId: string) {
  await connectDB()
  if (!mongoose.Types.ObjectId.isValid(memberId)) return []
  
  const upline: any[] = []
  let currentId: string | null = memberId
  
  while (currentId) {
    const node: any = await TreeNodeModel.findOne({ memberId: currentId })
    if (!node || !node.sponsorId) break
    
    const sponsor = await MemberModel.findById(node.sponsorId)
    if (sponsor) {
      upline.push(sponsor)
      currentId = node.sponsorId.toString()
    } else {
      break
    }
  }
  
  return upline
}

export async function updateTreeNode(memberId: string, updates: any) {
  await connectDB()
  if (!mongoose.Types.ObjectId.isValid(memberId)) return null
  return await TreeNodeModel.findOneAndUpdate({ memberId }, updates, { new: true })
}

// Package helpers
export async function findAllPackages() {
  await connectDB()
  return await PackageModel.find()
}

export async function findPackageById(id: string) {
  await connectDB()
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return await PackageModel.findById(id)
}

export async function findActivePackages() {
  await connectDB()
  return await PackageModel.find({ isActive: true })
}

export async function createPackage(data: {
  name: string
  price: number
  commissionRate: number
  description: string
  isActive?: boolean
}) {
  await connectDB()
  const pkg = await PackageModel.create(data)
  return pkg
}
