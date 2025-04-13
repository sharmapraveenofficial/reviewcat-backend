import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  platforms: string[];
  description: string;
  users: Array<{
    userId: Types.ObjectId;
    role: string;
    isAdmin: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot be more than 100 characters'],
    },
    platforms: {
      type: [String],
      enum: ['Google Play Store', 'App Store', 'Other'],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
      trim: true,
    },
    users: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          required: true,
          trim: true,
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
        _id: false, // Don't create _id for this subdocument
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>('Company', CompanySchema); 