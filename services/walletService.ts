import {
  findWalletByMemberIdAndType,
  updateWalletBalance,
  createTransaction,
  findTransactionsByFilters,
  findWalletsByMemberId,
  findMemberById,
} from '@/lib/db/helpers'
import mongoose from 'mongoose'

export interface DepositInput {
  memberId: string
  amount: number
}

export interface DepositResult {
  success: boolean
  transaction?: any
  error?: string
}

/**
 * Deposit funds to member's main wallet
 * Validates amount is positive, credits main wallet, creates transaction record
 */
export async function deposit(input: DepositInput): Promise<DepositResult> {
  try {
    const { memberId, amount } = input

    // Validate member ID
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    // Validate member exists
    const member = await findMemberById(memberId)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    // Validate deposit amount is positive
    if (amount <= 0) {
      return { success: false, error: 'Deposit amount must be positive' }
    }

    // Get main wallet
    const wallet = await findWalletByMemberIdAndType(memberId, 'main')
    if (!wallet) {
      return { success: false, error: 'Main wallet not found' }
    }

    const balanceBefore = wallet.balance
    const balanceAfter = balanceBefore + amount

    // Update wallet balance
    const updatedWallet = await updateWalletBalance(memberId, 'main', balanceAfter)
    if (!updatedWallet) {
      return { success: false, error: 'Failed to update wallet balance' }
    }

    // Create transaction record
    const transaction = await createTransaction({
      memberId,
      walletType: 'main',
      type: 'deposit',
      amount,
      balanceBefore,
      balanceAfter,
      description: `Deposit of ${amount}`,
    })

    return {
      success: true,
      transaction: {
        id: transaction._id.toString(),
        memberId: transaction.memberId.toString(),
        walletType: transaction.walletType,
        type: transaction.type,
        amount: transaction.amount,
        balanceBefore: transaction.balanceBefore,
        balanceAfter: transaction.balanceAfter,
        timestamp: transaction.timestamp,
        description: transaction.description,
      },
    }
  } catch (error: any) {
    console.error('Error processing deposit:', error)
    return { success: false, error: error.message || 'Deposit failed' }
  }
}

export interface WithdrawInput {
  memberId: string
  amount: number
  minWithdrawalAmount?: number
}

export interface WithdrawResult {
  success: boolean
  transaction?: any
  error?: string
}

/**
 * Withdraw funds from member's commission wallet
 * Validates balance, deducts from commission wallet, creates transaction record
 * Handles minimum withdrawal amount validation
 */
export async function withdraw(input: WithdrawInput): Promise<WithdrawResult> {
  try {
    const { memberId, amount, minWithdrawalAmount } = input

    // Validate member ID
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    // Validate member exists
    const member = await findMemberById(memberId)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    // Validate withdrawal amount is positive
    if (amount <= 0) {
      return { success: false, error: 'Withdrawal amount must be positive' }
    }

    // Validate minimum withdrawal amount if configured
    if (minWithdrawalAmount && amount < minWithdrawalAmount) {
      return {
        success: false,
        error: `Withdrawal amount must be at least ${minWithdrawalAmount}`,
      }
    }

    // Get commission wallet
    const wallet = await findWalletByMemberIdAndType(memberId, 'commission')
    if (!wallet) {
      return { success: false, error: 'Commission wallet not found' }
    }

    const balanceBefore = wallet.balance

    // Validate sufficient balance
    if (balanceBefore < amount) {
      return {
        success: false,
        error: 'Insufficient balance for withdrawal',
      }
    }

    const balanceAfter = balanceBefore - amount

    // Update wallet balance
    const updatedWallet = await updateWalletBalance(memberId, 'commission', balanceAfter)
    if (!updatedWallet) {
      return { success: false, error: 'Failed to update wallet balance' }
    }

    // Create transaction record
    const transaction = await createTransaction({
      memberId,
      walletType: 'commission',
      type: 'withdrawal',
      amount,
      balanceBefore,
      balanceAfter,
      description: `Withdrawal of ${amount}`,
    })

    return {
      success: true,
      transaction: {
        id: transaction._id.toString(),
        memberId: transaction.memberId.toString(),
        walletType: transaction.walletType,
        type: transaction.type,
        amount: transaction.amount,
        balanceBefore: transaction.balanceBefore,
        balanceAfter: transaction.balanceAfter,
        timestamp: transaction.timestamp,
        description: transaction.description,
      },
    }
  } catch (error: any) {
    console.error('Error processing withdrawal:', error)
    return { success: false, error: error.message || 'Withdrawal failed' }
  }
}

export interface GetBalanceInput {
  memberId: string
  walletType: 'main' | 'commission'
}

export interface GetBalanceResult {
  success: boolean
  balance?: number
  error?: string
}

/**
 * Get wallet balance by type
 * Returns the current balance for the specified wallet type
 */
export async function getBalance(input: GetBalanceInput): Promise<GetBalanceResult> {
  try {
    const { memberId, walletType } = input

    // Validate member ID
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    // Validate member exists
    const member = await findMemberById(memberId)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    // Get wallet
    const wallet = await findWalletByMemberIdAndType(memberId, walletType)
    if (!wallet) {
      return { success: false, error: `${walletType} wallet not found` }
    }

    return {
      success: true,
      balance: wallet.balance,
    }
  } catch (error: any) {
    console.error('Error getting balance:', error)
    return { success: false, error: error.message || 'Failed to get balance' }
  }
}

export interface GetBothBalancesResult {
  success: boolean
  mainBalance?: number
  commissionBalance?: number
  error?: string
}

/**
 * Get both wallet balances for a member
 * Returns main wallet and commission wallet balances
 */
export async function getBothBalances(memberId: string): Promise<GetBothBalancesResult> {
  try {
    // Validate member ID
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    // Validate member exists
    const member = await findMemberById(memberId)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    // Get both wallets
    const wallets = await findWalletsByMemberId(memberId)
    if (wallets.length !== 2) {
      return { success: false, error: 'Wallets not properly initialized' }
    }

    const mainWallet = wallets.find(w => w.type === 'main')
    const commissionWallet = wallets.find(w => w.type === 'commission')

    if (!mainWallet || !commissionWallet) {
      return { success: false, error: 'Wallets not properly initialized' }
    }

    return {
      success: true,
      mainBalance: mainWallet.balance,
      commissionBalance: commissionWallet.balance,
    }
  } catch (error: any) {
    console.error('Error getting both balances:', error)
    return { success: false, error: error.message || 'Failed to get balances' }
  }
}

export interface GetTransactionHistoryInput {
  memberId: string
  walletType?: 'main' | 'commission'
  transactionType?: 'deposit' | 'purchase' | 'commission' | 'withdrawal'
  startDate?: Date
  endDate?: Date
}

export interface GetTransactionHistoryResult {
  success: boolean
  transactions?: any[]
  error?: string
}

/**
 * Get transaction history with filtering
 * Supports filtering by wallet type, transaction type, and date range
 * Returns transactions ordered by timestamp descending (newest first)
 */
export async function getTransactionHistory(
  input: GetTransactionHistoryInput
): Promise<GetTransactionHistoryResult> {
  try {
    const { memberId, walletType, transactionType, startDate, endDate } = input

    // Validate member ID
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return { success: false, error: 'Invalid member ID' }
    }

    // Validate member exists
    const member = await findMemberById(memberId)
    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    // Build filters
    const filters: any = { memberId }

    if (walletType) {
      filters.walletType = walletType
    }

    if (transactionType) {
      filters.type = transactionType
    }

    if (startDate) {
      filters.startDate = startDate
    }

    if (endDate) {
      filters.endDate = endDate
    }

    // Get transactions with filters
    const transactions = await findTransactionsByFilters(filters)

    // Transform transactions for response
    const transformedTransactions = transactions.map(t => ({
      id: t._id.toString(),
      memberId: t.memberId.toString(),
      walletType: t.walletType,
      type: t.type,
      amount: t.amount,
      balanceBefore: t.balanceBefore,
      balanceAfter: t.balanceAfter,
      timestamp: t.timestamp,
      description: t.description,
      relatedMemberId: t.relatedMemberId?.toString(),
    }))

    return {
      success: true,
      transactions: transformedTransactions,
    }
  } catch (error: any) {
    console.error('Error getting transaction history:', error)
    return { success: false, error: error.message || 'Failed to get transaction history' }
  }
}
