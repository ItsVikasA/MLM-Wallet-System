import mongoose, { Schema, Document, Model } from 'mongoose'
import { Wallet as IWallet } from '@/types'

export interface WalletDocument extends Omit<IWallet, 'id' | 'memberId'>, Document {
  _id: mongoose.Types.ObjectId
  memberId: mongoose.Types.ObjectId
}

const walletSchema = new Schema<WalletDocument>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member ID is required'],
    },
    type: {
      type: String,
      enum: ['main', 'commission'],
      required: [true, 'Wallet type is required'],
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_: any, ret: any) => {
        ret.id = ret._id.toString()
        ret.memberId = ret.memberId.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

// Compound index to ensure one wallet of each type per member
walletSchema.index({ memberId: 1, type: 1 }, { unique: true })

// Prevent model recompilation in development
const WalletModel: Model<WalletDocument> =
  mongoose.models.Wallet || mongoose.model<WalletDocument>('Wallet', walletSchema)

export default WalletModel
