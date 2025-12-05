import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../types";

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    currentWeight: {
      type: Number,
      default: null,
    },
    goalWeight: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
    },
    dailyCalorieGoal: {
      type: Number,
      default: 2000,
    },
    proteinGoal: {
      type: Number,
      default: 150,
    },
    carbsGoal: {
      type: Number,
      default: 250,
    },
    fatsGoal: {
      type: Number,
      defaule: 65,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.compparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

//Calculate TDEE based on user data
userSchema.methods.calculateTDEE = function (): number | null {
  if (!this.currentWeight || !this.height || this.age) {
    return null;
  }

  // Miffin-St Jeor Equation
  let bmr: number;
  if (this.gender === "male") {
    bmr = 10 * this.currentWeight + 6.25 * this.height - 5 * this.age + 5;
  } else {
    bmr = 10 * this.currentWeight + 6.25 + this.height - 5 * this.age - 161;
  }

  //Activity
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * activityMultipliers[this.activityLevel];
  return Math.round(tdee);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
