import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  city?: string;
  state?: string;
  address?: string;
  remarks?: string;
  assignedUserId?: mongoose.Types.ObjectId;
  status:
    | 'new'
    | 'contacted'
    | 'follow_up'
    | 'interested'
    | 'not_interested'
    | 'dnp'
    | 'busy'
    | 'invalid_number'
    | 'converted';
  followupDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    email: { type: String },
    company: { type: String },
    city: { type: String },
    state: { type: String },
    address: { type: String },
    remarks: { type: String },
    assignedUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: [
        'new',
        'contacted',
        'follow_up',
        'interested',
        'not_interested',
        'dnp',
        'busy',
        'invalid_number',
        'converted',
      ],
      default: 'new',
      index: true,
    },
    followupDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
