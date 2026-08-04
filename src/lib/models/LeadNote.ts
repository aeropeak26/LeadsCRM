import mongoose, { Schema, Document } from 'mongoose';
import { LeadStatus } from '../types';

export interface ILeadNote extends Document {
  _id: string;
  leadId: string;
  userId: string;
  userName: string;
  note: string;
  statusAtTime: LeadStatus;
  createdAt: string;
}

const LeadNoteSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    leadId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    note: { type: String, required: true },
    statusAtTime: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

LeadNoteSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.models.LeadNote || mongoose.model<ILeadNote>('LeadNote', LeadNoteSchema);
