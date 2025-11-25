import { Request } from "express";
import { Document } from "mongoose";

// User Types
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  currentWeight?: number;
  goalWeight?: number;
  height?: number;
  age?: number;
  genger: "male" | "female" | "other";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very active";
  dailyCalorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  calculateTDEE(): number | null;
}

export interface IUserInput {
  email: string;
  password: string;
  name: string;
  currentWeight?: number;
  goalWeight?: number;
  height?: number;
  age?: number;
  genger?: "male" | "female" | "other";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very active";
  dailyCalorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatsGoal?: number;
}

// Food Types
export interface IFood extends Document {
  _id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: number;
  servingUnit: string;
  barcode?: string;
  imageUrl?: string;
  category:
    | "protein"
    | "carbs"
    | "fats"
    | "vagetables"
    | "fruits"
    | "dairy"
    | "snacks"
    | "drinks"
    | "other";
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFoodInput {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: number;
  servingUnit: string;
  barcode?: string;
  imageUrl?: string;
  category?:
    | "protein"
    | "carbs"
    | "fats"
    | "vagetables"
    | "fruits"
    | "dairy"
    | "snacks"
    | "drinks"
    | "other";
  isPublic?: boolean;
}
