import { Request } from "express";
import { Document } from "mongoose";

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
}
