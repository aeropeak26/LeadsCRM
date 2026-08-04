import mongoose, { Schema, Document } from 'mongoose';
import { LeadStatus } from '../types';

export interface ILead extends Document {
  _id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  city: string;
  state: string;
  address: string;
  remarks: string;
  assignedUserId: string | null;
  assignedUserName?: string;
  status: LeadStatus;
  followupDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const LeadSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    company: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    address: { type: String, default: '' },
    remarks: { type: String, default: '' },
    assignedUserId: { type: String, default: null },
    assignedUserName: { type: String },
    status: { type: String, required: true },
    followupDate: { type: String, default: null },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

LeadSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
