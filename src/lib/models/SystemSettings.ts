import mongoose, { Schema, Document } from 'mongoose';
import { LeadStatus } from '../types';

export interface ISystemSettings extends Document {
  _id: string; // we will use a single id like 'settings'
  companyName: string;
  supportEmail: string;
  currency: string;
  autoDistributionEnabled: boolean;
  duplicateCheckPhone: boolean;
  defaultFollowupDays: number;
  leadStatuses: { key: LeadStatus; label: string; color: string }[];
}

const SystemSettingsSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    companyName: { type: String, required: true },
    supportEmail: { type: String, required: true },
    currency: { type: String, required: true },
    autoDistributionEnabled: { type: Boolean, required: true },
    duplicateCheckPhone: { type: Boolean, required: true },
    defaultFollowupDays: { type: Number, required: true },
    leadStatuses: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        color: { type: String, required: true },
      },
    ],
  },
  {
    _id: false,
    versionKey: false,
  }
);

SystemSettingsSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.models.SystemSettings ||
  mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
