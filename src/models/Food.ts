import mongoose, { Schema, Model } from "mongoose";
import { IFood } from "../types";

const foodSchema = new Schema<IFood>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "food name is required"],
      trim: true,
    },
    calories: {
      type: Number,
      required: [true, "Calories are required"],
      min: [0, "Calories cannot be negative"],
    },
    protein: {
      type: Number,
      required: [true, "Protein is required"],
      min: [0, "Protein cannot be negative"],
      default: 0,
    },
    carbs: {
      type: Number,
      required: [true, "Carbs are required"],
      min: [0, "Carbs cannot be negative"],
      default: 0,
    },
    fats: {
      type: Number,
      required: [true, "Fats are required"],
      min: [0, "Fats cannot be negative"],
      default: 0,
    },
    servingSize: {
      type: Number,
      required: [true, "Serving size is required"],
      min: [0, "Serving size cannot be negative"],
      default: 100,
    },
    servingUnit: {
      type: String,
      required: [true, "Serving size is required"],
      default: "g",
      trim: true,
    },
    barcode: {
      type: String,
      default: null,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: [
        "protein",
        "carbs",
        "fats",
        "vegetables",
        "fruits",
        "dairy",
        "snacks",
        "drinks",
        "other",
      ],
      default: "other",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster searches
foodSchema.index({ userId: 1, name: "text" });
foodSchema.index({ userId: 1, category: 1 });

const Food: Model<IFood> = mongoose.model<IFood>("Food", foodSchema);

export default Food;
