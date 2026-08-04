import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadNote extends Document {
  leadId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  note: string;
  statusAtTime: string;
  createdAt: Date;
}

const LeadNoteSchema = new Schema<ILeadNote>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    note: { type: String, required: true },
    statusAtTime: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.LeadNote || mongoose.model<ILeadNote>('LeadNote', LeadNoteSchema);
