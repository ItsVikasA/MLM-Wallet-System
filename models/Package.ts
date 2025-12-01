import mongoose, { Schema, Document, Model } from 'mongoose'
import { Package as IPackage } from '@/types'

export interface PackageDocument extends Omit<IPackage, 'id'>, Document {
  _id: mongoose.Types.ObjectId
}

const packageSchema = new Schema<PackageDocument>(
  {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be positive'],
    },
    commissionRate: {
      type: Number,
      required: [true, 'Commission rate is required'],
      min: [0, 'Commission rate cannot be negative'],
      max: [1, 'Commission rate cannot exceed 100%'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_: any, ret: any) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

// Indexes
packageSchema.index({ isActive: 1 })
packageSchema.index({ name: 1 }, { unique: true })

// Prevent model recompilation in development
const PackageModel: Model<PackageDocument> =
  mongoose.models.Package ||
  mongoose.model<PackageDocument>('Package', packageSchema)

export default PackageModel
