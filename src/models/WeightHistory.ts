import mongoose, { Schema, Model } from "mongoose";
import { IWeightHistory } from "../types";

interface IWeightHistoryModel extends Model<IWeightHistory> {
  getWeightTrend(userId: string, days?: number): Promise<IWeightHistory[]>;
  getLatestWeight(userId: string): Promise<IWeightHistory> | null;
}

const weightHistorySchema = new Schema<IWeightHistory, IWeightHistoryModel>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [0, "Weight must be positive"],
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      default: null,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
weightHistorySchema.index({ userId: 1, date: -1 });

// Static method to get weight trend
weightHistorySchema.statics.getWeightTrend = async function (
  userId: string,
  days: number = 30
): Promise<IWeightHistory[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.find({
    userId,
    date: { $gte: startDate },
  }).sort({ date: 1 });
};

// Static method to get lates weight

weightHistorySchema.statics.getLatesWeight = async function (
  userId: string
): Promise<IWeightHistory | null> {
  return await this.findOne({ userId }).sort({ date: -1 });
};

const WeightHistory = mongoose.model<IWeightHistory, IWeightHistoryModel>(
  "WeightHistory",
  weightHistorySchema
);

export default WeightHistory;
