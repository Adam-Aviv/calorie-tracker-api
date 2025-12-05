import { Request } from "express";
import { Document } from "mongoose";
import { NumberLiteralType } from "typescript";

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
  gender: "male" | "female" | "other";
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
  gender?: "male" | "female" | "other";
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

// Food Log Types
export interface IFoodLog extends Document {
  _id: string;
  userId: string;
  foodId: string;
  date: Date;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  foodName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFoodLogInput {
  foodId: string;
  date: string | Date;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
  notes?: string;
}

export interface IDailySummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  mealBreakdown: {
    [key: string]: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      count: number;
    };
  };
}

// Weight History types
export interface IWeightHistory extends Document {
  _id: string;
  userId: string;
  weight: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface IWeightInput {
  weight: number;
  date: string | Date;
  notes?: string;
}

export interface IWeightTrend {
  count: number;
  average: number;
  change: number;
  changePercentage: string;
}

//Auth Types

export interface IAuthRequest extends Request {
  user?: IUser;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IRegisterInput {
  email: string;
  password: string;
  name: string;
}

// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

export interface IPaginationResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

//Query Types
export interface IfoodQuery {
  search?: string;
  category?: string;
  page?: string;
  limit?: string;
}

export interface ILogQuery {
  startDate?: string;
  endDate?: string;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
}

export interface IWeightQuery {
  startDate?: string;
  endDate?: string;
  limit?: string;
}

//JWT Payload
export interface IJWTPayload {
  id: string;
  iat?: number;
  exp?: number;
}

//TDEE Calculation Result
export interface ITDEEResult {
  tdee: number;
  bmr: number;
  recommendation: {
    maintain: number;
    mildWeightLoss: number;
    weightLoss: number;
    extremeWeightLoss: number;
  };
}
