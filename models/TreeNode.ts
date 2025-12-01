import mongoose, { Schema, Document, Model } from 'mongoose'
import { TreeNode as ITreeNode } from '@/types'

export interface TreeNodeDocument extends Omit<ITreeNode, 'memberId'>, Document {
  _id: mongoose.Types.ObjectId
  memberId: mongoose.Types.ObjectId
}

const treeNodeSchema = new Schema<TreeNodeDocument>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member ID is required'],
      unique: true,
    },
    sponsorId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
    leftChildId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
    rightChildId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
    leftLegVolume: {
      type: Number,
      default: 0,
      min: [0, 'Left leg volume cannot be negative'],
    },
    rightLegVolume: {
      type: Number,
      default: 0,
      min: [0, 'Right leg volume cannot be negative'],
    },
    position: {
      type: String,
      enum: ['root', 'left', 'right'],
      required: [true, 'Position is required'],
    },
    depth: {
      type: Number,
      required: [true, 'Depth is required'],
      min: [0, 'Depth cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_: any, ret: any) => {
        ret.memberId = ret.memberId.toString()
        if (ret.sponsorId) ret.sponsorId = ret.sponsorId.toString()
        if (ret.leftChildId) ret.leftChildId = ret.leftChildId.toString()
        if (ret.rightChildId) ret.rightChildId = ret.rightChildId.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

// Indexes for efficient tree traversal
treeNodeSchema.index({ memberId: 1 }, { unique: true })
treeNodeSchema.index({ sponsorId: 1 })
treeNodeSchema.index({ leftChildId: 1 })
treeNodeSchema.index({ rightChildId: 1 })
treeNodeSchema.index({ depth: 1 })

// Prevent model recompilation in development
const TreeNodeModel: Model<TreeNodeDocument> =
  mongoose.models.TreeNode ||
  mongoose.model<TreeNodeDocument>('TreeNode', treeNodeSchema)

export default TreeNodeModel
