import express, { Response } from "express";
import { body, validationResult } from "express-validator";
import FoodLog from "../models/FoodLog";
import Food from "../models/Food";
import { protect } from "../middleware/auth";
import { IAuthRequest, IFoodLogInput, ILogQuery } from "../types";

const router = express.Router();

// @route   GET /api/logs
// @desc    Get food logs for a date range
// @access  Private
router.get(
  "/",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, mealType } = req.query as ILogQuery;

      const query: any = { userId: req.user?.id };

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      if (mealType) {
        query.mealType = mealType;
      }

      const logs = await FoodLog.find(query)
        .populate("foodId")
        .sort({ date: -1, createdAt: -1 });

      res.json({
        success: true,
        data: logs,
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

// @route   GET /api/logs/daily/:date
// @desc    Get all logs for a specific date
// @access  Private
router.get(
  "/daily/:date",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const date = new Date(req.params.date);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const logs = await FoodLog.find({
        userId: req.user?.id,
        date: { $gte: startOfDay, $lte: endOfDay },
      })
        .populate("foodId")
        .sort({ mealType: 1, createdAt: 1 });

      const summary = await FoodLog.getDailySummary(
        req.user?.id as string,
        req.params.date
      );

      res.json({
        success: true,
        data: {
          logs,
          summary,
        },
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

// @route   GET /api/logs/summary/:startDate/:endDate
// @desc    Get summary for date range
// @access  Private
router.get(
  "/summary/:startDate/:endDate",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const summary = await FoodLog.getDateRangeSummary(
        req.user?.id as string,
        req.params.startDate,
        req.params.endDate
      );

      res.json({
        success: true,
        data: summary,
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

// @route   POST /api/logs
// @desc    Create new food log entry
// @access  Private
router.post(
  "/",
  [
    protect,
    body("foodId").notEmpty().withMessage("Food ID is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("mealType")
      .isIn(["breakfast", "lunch", "dinner", "snack"])
      .withMessage("Invalid meal type"),
    body("servings").isNumeric().withMessage("Servings must be a number"),
  ],
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        });
        return;
      }

      const { foodId, date, mealType, servings, notes } =
        req.body as IFoodLogInput;

      const food = await Food.findOne({
        _id: foodId,
        userId: req.user?.id,
      });

      if (!food) {
        res.status(404).json({
          success: false,
          message: "Food not found",
        });
        return;
      }

      const servingsNum = servings || 1;
      const log = await FoodLog.create({
        userId: req.user?.id,
        foodId: food._id,
        date: new Date(date),
        mealType,
        servings: servingsNum,
        calories: food.calories * servingsNum,
        protein: food.protein * servingsNum,
        carbs: food.carbs * servingsNum,
        fats: food.fats * servingsNum,
        foodName: food.name,
        notes,
      });

      const populatedLog = await FoodLog.findById(log._id).populate("foodId");

      res.status(201).json({
        success: true,
        data: populatedLog,
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

// @route   PUT /api/logs/:id
// @desc    Update food log entry
// @access  Private
router.put(
  "/:id",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const log = await FoodLog.findOne({
        _id: req.params.id,
        userId: req.user?.id,
      });

      if (!log) {
        res.status(404).json({
          success: false,
          message: "Log not found",
        });
        return;
      }

      // If servings changed, recalculate nutritional values
      if (req.body.servings && req.body.servings !== log.servings) {
        const food = await Food.findById(log.foodId);
        if (food) {
          req.body.calories = food.calories * req.body.servings;
          req.body.protein = food.protein * req.body.servings;
          req.body.carbs = food.carbs * req.body.servings;
          req.body.fats = food.fats * req.body.servings;
        }
      }

      const updatedLog = await FoodLog.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      ).populate("foodId");

      res.json({
        success: true,
        data: updatedLog,
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

// @route   DELETE /api/logs/:id
// @desc    Delete food log entry
// @access  Private
router.delete(
  "/:id",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const log = await FoodLog.findOne({
        _id: req.params.id,
        userId: req.user?.id,
      });

      if (!log) {
        res.status(404).json({
          success: false,
          message: "Log not found",
        });
        return;
      }

      await FoodLog.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Log deleted successfully",
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
