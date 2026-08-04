import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowup extends Document {
  _id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  leadCompany: string;
  assignedUserId: string;
  assignedUserName: string;
  scheduledAt: string;
  notes: string;
  status: 'pending' | 'completed' | 'overdue';
  createdAt: string;
}

const FollowupSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    leadId: { type: String, required: true },
    leadName: { type: String, required: true },
    leadPhone: { type: String, default: '' },
    leadCompany: { type: String, default: '' },
    assignedUserId: { type: String, required: true },
    assignedUserName: { type: String, required: true },
    scheduledAt: { type: String, required: true },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed', 'overdue'], required: true },
    createdAt: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

FollowupSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.models.Followup || mongoose.model<IFollowup>('Followup', FollowupSchema);
