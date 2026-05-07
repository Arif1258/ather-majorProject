import mongoose, { Schema, Document } from 'mongoose';

export interface ICheckResult {
  timestamp: Date;
  responseTime: number;
  status: 'UP' | 'DOWN';
  statusCode?: number;
  healthStatus: 'Healthy' | 'Slow' | 'Down';
  regionData?: {
    region: string;
    responseTime: number;
    status: 'UP' | 'DOWN';
  }[];
}

export interface IWebsite extends Document {
  url: string;
  name?: string;
  lastCheck?: Date;
  status?: 'UP' | 'DOWN';
  warningStatus?: 'Normal' | 'Degrading' | 'Unstable';
  healthStatus?: 'Healthy' | 'Slow' | 'Down';
  healthScore?: number;
  incidents: { timestamp: Date; message: string; resolved: boolean; severity?: 'Info' | 'Warning' | 'Critical' }[];
  isPaused?: boolean;
  visualChange?: boolean;
  checks: ICheckResult[];
  createdAt: Date;
  updatedAt: Date;
}

const CheckResultSchema = new Schema<ICheckResult>({
  timestamp: { type: Date, default: Date.now },
  responseTime: { type: Number, required: true },
  status: { type: String, enum: ['UP', 'DOWN'], required: true },
  statusCode: { type: Number },
  healthStatus: { type: String, enum: ['Healthy', 'Slow', 'Down'], required: true },
  regionData: [
    {
      region: { type: String, required: true },
      responseTime: { type: Number, required: true },
      status: { type: String, enum: ['UP', 'DOWN'], required: true }
    }
  ]
}, { _id: false });

const WebsiteSchema = new Schema<IWebsite>({
  url: { type: String, required: true, unique: true },
  name: { type: String },
  lastCheck: { type: Date },
  status: { type: String, enum: ['UP', 'DOWN'] },
  warningStatus: { type: String, enum: ['Normal', 'Degrading', 'Unstable'], default: 'Normal' },
  healthStatus: { type: String, enum: ['Healthy', 'Slow', 'Down'] },
  healthScore: { type: Number, default: 100 },
  incidents: [{
    timestamp: { type: Date, default: Date.now },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    severity: { type: String, enum: ['Info', 'Warning', 'Critical'], default: 'Warning' }
  }],
  isPaused: { type: Boolean, default: false },
  visualChange: { type: Boolean, default: false },
  checks: [CheckResultSchema],
}, {
  timestamps: true
});

export const Website = mongoose.models.Website || mongoose.model<IWebsite>('Website', WebsiteSchema);
