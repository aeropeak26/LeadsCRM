import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, UserStatus } from '../types';

export interface IUser extends Document {
  _id: string; // use string instead of ObjectId for easier frontend compat
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  createdAt: string;
}

const UserSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'sales_rep'], required: true },
    status: { type: String, enum: ['active', 'disabled'], required: true },
    password: { type: String },
    createdAt: { type: String, required: true },
  },
  {
    _id: false, // Prevents auto-generation of ObjectId, we will provide it
    versionKey: false,
  }
);

// Transform _id to id when sending JSON
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
