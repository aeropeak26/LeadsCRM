import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowup extends Document {
  leadId: mongoose.Types.ObjectId;
  assignedUserId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  notes: string;
  status: 'pending' | 'completed' | 'overdue';
  createdAt: Date;
}

const FollowupSchema = new Schema<IFollowup>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    assignedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true, index: true },
    notes: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.models.Followup || mongoose.model<IFollowup>('Followup', FollowupSchema);
