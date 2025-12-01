// Core type definitions for MLM Wallet System

export interface Member {
  id: string
  username: string
  passwordHash: string
  sponsorId: string | null
  registrationDate: Date
  status: 'active' | 'inactive' | 'suspended'
  activePackageId: string | null
}

export interface Wallet {
  id: string
  memberId: string
  type: 'main' | 'commission'
  balance: number
  lastUpdated: Date
}

export interface Transaction {
  id: string
  memberId: string
  walletType: 'main' | 'commission'
  type: 'deposit' | 'purchase' | 'commission' | 'withdrawal'
  amount: number
  balanceBefore: number
  balanceAfter: number
  timestamp: Date
  description: string
  relatedMemberId?: string
}

export interface TreeNode {
  memberId: string
  sponsorId: string | null
  leftChildId: string | null
  rightChildId: string | null
  leftLegVolume: number
  rightLegVolume: number
  position: 'root' | 'left' | 'right'
  depth: number
}

export interface Package {
  id: string
  name: string
  price: number
  commissionRate: number
  description: string
  isActive: boolean
}

export interface CommissionResult {
  memberId: string
  amount: number
  fromMemberId: string
  packageAmount: number
  leg: 'left' | 'right'
}

export type WalletType = 'main' | 'commission'
export type TransactionType = 'deposit' | 'purchase' | 'commission' | 'withdrawal'
export type MemberStatus = 'active' | 'inactive' | 'suspended'
export type TreePosition = 'root' | 'left' | 'right'
