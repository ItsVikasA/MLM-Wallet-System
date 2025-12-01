import mongoose, { Schema, Document, Model } from 'mongoose'
import { Transaction as ITransaction } from '@/types'

export interface TransactionDocument extends Omit<ITransaction, 'id' | 'memberId' | 'relatedMemberId'>, Document {
  _id: mongoose.Types.ObjectId
  memberId: mongoose.Types.ObjectId
  relatedMemberId?: mongoose.Types.ObjectId
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member ID is required'],
    },
    walletType: {
      type: String,
      enum: ['main', 'commission'],
      required: [true, 'Wallet type is required'],
    },
    type: {
      type: String,
      enum: ['deposit', 'purchase', 'commission', 'withdrawal'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    balanceBefore: {
      type: Number,
      required: [true, 'Balance before is required'],
      min: [0, 'Balance before cannot be negative'],
    },
    balanceAfter: {
      type: Number,
      required: [true, 'Balance after is required'],
      min: [0, 'Balance after cannot be negative'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    relatedMemberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_: any, ret: any) => {
        ret.id = ret._id.toString()
        ret.memberId = ret.memberId.toString()
        if (ret.relatedMemberId) {
          ret.relatedMemberId = ret.relatedMemberId.toString()
        }
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

// Indexes for efficient queries
transactionSchema.index({ memberId: 1, timestamp: -1 })
transactionSchema.index({ memberId: 1, walletType: 1 })
transactionSchema.index({ memberId: 1, type: 1 })
transactionSchema.index({ timestamp: -1 })

// Prevent model recompilation in development
const TransactionModel: Model<TransactionDocument> =
  mongoose.models.Transaction ||
  mongoose.model<TransactionDocument>('Transaction', transactionSchema)

export default TransactionModel
