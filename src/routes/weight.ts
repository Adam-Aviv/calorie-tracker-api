import express, { Response } from "express";
import { body, validationResult } from "express-validator";
import WeightHistory from "../models/WeightHistory";
import { protect } from "../moddleware/auth";
import {
  IAuthRequest,
  IWeightInput,
  IWeightQuery,
  IWeightTrend,
} from "../types";

const router = express.Router();

// @route   Get /api/weight
// @desc    Get weight history
// @access  Private
router.get(
  "/",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, limit = "100" } = req.query as IWeightQuery;

      const query: any = { userId: req.user?.id };

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const weights = await WeightHistory.find(query)
        .sort({ date: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: weights,
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

// @route   GET /api/weight/latest
// @desc    Get latest weight entry
// @access  Private
router.get(
  "/latest",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const weight = await WeightHistory.getLatestWeight(
        req.user?.id as string
      );

      if (!weight) {
        res.status(404).json({
          success: false,
          message: "Mp weight entries found",
        });
        return;
      }

      res.json({
        success: true,
        data: weight,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: "server error",
        error: err.message,
      });
    }
  }
);

//@route    GET /api/weight/trend/:days
//@desc     Get weight trend for x days
//@access   Private
router.get(
  "/trend/:days",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const days = parseInt(req.params.days) || 30;
      const trend = await WeightHistory.getWeightTrend(
        req.user?.id as string,
        days
      );

      const stats: IWeightTrend = {
        count: trend.length,
        average: 0,
        change: 0,
        changePercentage: "0",
      };

      if (trend.length > 0) {
        stats.average =
          trend.reduce((sum, w) => sum + w.weight, 0) / trend.length;
      }

      if (trend.length > 1) {
        const oldest = trend[0].weight;
        const newest = trend[trend.length - 1].weight;
        stats.change = newest - oldest;
        stats.changePercentage = ((stats.change / oldest) * 100).toFixed(2);
      }

      res.json({
        success: true,
        data: {
          trend,
          stats,
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

// @route   POST /api/weight
// @desc    Add weight entry
// @access  Private
router.post(
  "/",
  [
    protect,
    body("weight").isNumeric().withMessage("Weight must be a number"),
    body("date").notEmpty().withMessage("Date is required"),
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

      const { weight, date, notes } = req.body as IWeightInput;

      const weightEntry = await WeightHistory.create({
        userId: req.user?.id,
        weight,
        date: new Date(date),
        notes,
      });

      res.status(201).json({
        success: true,
        data: weightEntry,
      });
    } catch (error) {}
  }
);

// @route   PUT /api/weight/:id
// @desc    Update weight entry
// @access  Private
router.put(
  "/:id",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      let weight = await WeightHistory.findOne({
        _id: req.params.id,
        userId: req.user?.id,
      });

      if (!weight) {
        res.status(404).json({
          success: false,
          message: "Weight entry not found",
        });
        return;
      }

      weight = await WeightHistory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        data: weight,
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

// @route   DELETE /api/weight/:id
// @desc    Delete weight entry
// @access  Private
router.delete(
  "/:id",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const weight = await WeightHistory.findOne({
        _id: req.params.id,
        userId: req.user?.id,
      });

      if (!weight) {
        res.status(404).json({
          success: false,
          message: "Weight entry not found",
        });
        return;
      }

      await WeightHistory.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Weight entry deleted successfully",
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
