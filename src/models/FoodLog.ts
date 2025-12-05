import mongoose, { Schema, Model } from "mongoose";
import { IFoodLog, IDailySummary } from "../types";

interface IFoodLogModel extends Model<IFoodLog> {
  getDailySummary(userId: string, date: string | Date): Promise<IDailySummary>;
  getDateRangeSummary(
    userId: string,
    startDate: string | Date,
    endDate: string | Date
  ): Promise<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    count: number;
  }>;
}

const foodLogSchema = new Schema<IFoodLog, IFoodLogModel>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    foodId: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: [true, "Meal type is required"],
    },
    servings: {
      type: Number,
      required: [true, "Servings are required"],
      min: [0.1, "Servings must be at least 0.1"],
      default: 1,
    },
    calories: {
      type: Number,
      required: true,
    },
    protein: {
      type: Number,
      required: true,
    },
    carbs: {
      type: Number,
      required: true,
    },
    fats: {
      type: Number,
      required: true,
    },
    foodName: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: null,
      maxLength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compund indexes for efficiend date-based queries
foodLogSchema.index({ userId: 1, date: 1 });
foodLogSchema.index({ userId: 1, date: 1, mealType: 1 });

// Static method to get daily summary
foodLogSchema.statics.getDailySummary = async function (
  userId: string,
  date: string | Date
): Promise<IDailySummary> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const logs = await this.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  const summary: IDailySummary = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    mealBreakdown: {
      breakfast: { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 },
      lunch: { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 },
      dinner: { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 },
      snack: { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 },
    },
  };

  logs.forEach((log) => {
    summary.totalCalories += log.calories;
    summary.totalProtein += log.protein;
    summary.totalCarbs += log.carbs;
    summary.totalFats += log.fats;

    const meal = summary.mealBreakdown[log.mealType];
    meal.calories += log.calories;
    meal.protein += log.protein;
    meal.carbs += log.carbs;
    meal.fats += log.fats;
    meal.count += 1;
  });

  return summary;
};

foodLogSchema.statics.getDateRangeSummary = async function (
  userId: string,
  startDate: string | Date,
  endDate: string | Date
) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const logs = await this.aggregate([
    {
      $match: {
        userId,
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalCalories: { $sum: "$calories" },
        totalProtein: { $sum: "$proten" },
        totalCarbs: { $sum: "$carbs" },
        totalFats: { $sum: "$fats" },
        count: { $sum: 1 },
      },
    },
  ]);

  return (
    logs[0] || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      count: 0,
    }
  );
};

const FoodLog = mongoose.model<IFoodLog, IFoodLogModel>(
  "FoodLog",
  foodLogSchema
);

export default FoodLog;
