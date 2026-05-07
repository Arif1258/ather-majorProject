import mongoose, { Schema, Document } from 'mongoose';

export interface IMonitoringLog extends Document {
  websiteId: mongoose.Types.ObjectId;
  timestamp: Date;
  responseTime: number;
  status: 'UP' | 'DOWN';
  statusCode?: number;
  healthStatus: 'Healthy' | 'Slow' | 'Down';
  regionData: {
    region: string;
    responseTime: number;
    status: 'UP' | 'DOWN';
  }[];
}

const MonitoringLogSchema = new Schema<IMonitoringLog>({
  websiteId: { type: Schema.Types.ObjectId, ref: 'Website', required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
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
});

// Compound index for timeseries optimization query
MonitoringLogSchema.index({ websiteId: 1, timestamp: -1 });

export const MonitoringLog = mongoose.models.MonitoringLog || mongoose.model<IMonitoringLog>('MonitoringLog', MonitoringLogSchema);
