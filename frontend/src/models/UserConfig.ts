import mongoose, { Schema, Document } from 'mongoose';

export interface IUserConfig extends Document {
  alertEmail: string;
}

const UserConfigSchema = new Schema<IUserConfig>({
  alertEmail: { type: String, default: "" },
});

export const UserConfig = mongoose.models.UserConfig || mongoose.model<IUserConfig>('UserConfig', UserConfigSchema);
