// src/lib/models/Task.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITaskDocument extends Document {
  date: Date;
  tasks: string[];
  note?: string;
  images?: string[];
  driveLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    tasks: {
      type: [String],
      required: [true, 'At least one task is required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one task description is required',
      },
    },
    note: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    driveLink: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Task: Model<ITaskDocument> =
  mongoose.models.Task || mongoose.model<ITaskDocument>('Task', TaskSchema);

export default Task;
