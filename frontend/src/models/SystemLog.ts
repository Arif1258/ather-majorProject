import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemLog extends Document {
  timestamp: Date;
  message: string;
  severity: 'Info' | 'Warning' | 'Critical';
  source: string;
}

const SystemLogSchema = new Schema<ISystemLog>({
  timestamp: { type: Date, default: Date.now },
  message: { type: String, required: true },
  severity: { type: String, enum: ['Info', 'Warning', 'Critical'], required: true },
  source: { type: String, required: true }
});

export const SystemLog = mongoose.models.SystemLog || mongoose.model<ISystemLog>('SystemLog', SystemLogSchema);
