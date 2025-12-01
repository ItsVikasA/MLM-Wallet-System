import mongoose, { Schema, Document, Model } from 'mongoose'
import { Member as IMember } from '@/types'

export interface MemberDocument extends Omit<IMember, 'id'>, Document {
  _id: mongoose.Types.ObjectId
}

const memberSchema = new Schema<MemberDocument>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    sponsorId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      required: true,
    },
    activePackageId: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_: any, ret: any) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.passwordHash
        return ret
      },
    },
  }
)

// Indexes for performance
memberSchema.index({ username: 1 }, { unique: true })
memberSchema.index({ sponsorId: 1 })
memberSchema.index({ status: 1 })

// Prevent model recompilation in development
const MemberModel: Model<MemberDocument> =
  mongoose.models.Member || mongoose.model<MemberDocument>('Member', memberSchema)

export default MemberModel
