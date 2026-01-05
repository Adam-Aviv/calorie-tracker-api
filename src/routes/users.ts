import express, { Response } from "express";
import User from "../models/User";
import { protect } from "../middleware/auth";
import { IAuthRequest, IUserInput, ITDEEResult } from "../types";

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get(
  "/profile",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user?.id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
      });
    }
  }
);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const allowedUpdates = [
        "name",
        "currentWeight",
        "goalWeight",
        "height",
        "age",
        "gender",
        "activityLevel",
        "dailyCalorieGoal",
        "proteinGoal",
        "carbsGoal",
        "fatsGoal",
      ] as const;

      const updates: Partial<IUserInput> = {};
      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field] as any;
        }
      });

      const user = await User.findByIdAndUpdate(req.user?.id, updates, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
      });
    }
  }
);

// @route   GET /api/users/calculate-tdee
// @desc    Calculate TDEE for user
// @access  Private
router.get(
  "/calculate-tdee",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user?.id);

      if (!user) {
        res.status(404).json({
          sucess: false,
          message: "User not found",
        });
        return;
      }

      const tdee = user.calculateTDEE();

      if (!tdee) {
        res.status(400).json({
          success: false,
          message:
            "Please update your weight, height, and age to calculate TDEE",
        });
        return;
      }

      const result: ITDEEResult = {
        tdee,
        bmr: Math.round(tdee / 1.55),
        recommendation: {
          maintain: tdee,
          mildWeightLoss: Math.round(tdee - 250),
          weightLoss: Math.round(tdee - 500),
          extremeWeightLoss: Math.round(tdee - 1000),
        },
      };

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
      });
    }
  }
);

export default router;
