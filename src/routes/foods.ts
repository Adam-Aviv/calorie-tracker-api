import express, { Response } from "express";
import { body, validationResult } from "express-validator";
import Food from "../models/Food";
import { protect } from "../middleware/auth";
import { IAuthRequest, IfoodQuery } from "../types";

const router = express.Router();

// @route   GET /api/foods
// @desc    Get all foods for user
// @access  Private
router.get(
  "/",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const {
        search,
        category,
        page = "1",
        limit = "50",
      } = req.query as IfoodQuery;

      const query: any = { userId: req.user?.id };

      if (search) {
        query.$text = { $search: search };
      }

      if (category) {
        query.category = category;
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const foods = await Food.find(query)
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum);

      const count = await Food.countDocuments(query);

      res.json({
        success: true,
        data: foods,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(count / limitNum),
          totalItems: count,
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

// @route   GET /api/foods/:id
// @desc    Get single food
// @access  Private
router.get(
  "/:id",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const food = await Food.findOne({
        _id: req.params.id,
        userId: req.user?.id,
      });

      if (!food) {
        res.status(404).json({
          success: false,
          message: "Food not found",
        });
        return;
      }

      res.json({
        success: true,
        data: food,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  }
);

// @route   POST /api/foods
// @desc    Create new food
// @access  Private
router.post(
  "/",
  [
    protect,
    body("name").notEmpty().withMessage("Food name is required"),
    body("calories").isNumeric().withMessage("Calories must be a number"),
    body("protein").isNumeric().withMessage("Protein must be a number"),
    body("carbs").isNumeric().withMessage("Carbs must be a number"),
    body("fats").isNumeric().withMessage("Fats must be a number"),
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

      const food = await Food.create({
        ...req.body,
        userId: req.user?.id,
      });

      res.status(201).json({
        success: true,
        data: food,
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

// @route   PUT /api/foods/:id
// @desc    Update food
// @access  Private
router.put(
  "/:id",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      let food = await Food.findOne({
        _id: req.params.id,
        userId: req.user?.id,
      });

      if (!food) {
        res.status(404).json({
          success: false,
          message: "Food not found",
        });
        return;
      }

      food = await Food.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        data: food,
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

// @route   DELETE /api/foods/:id
// @desc    Delete food
// @access  Private
router.delete(
  "/:id",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
      const food = await Food.findOne({
        _id: req.params.id,
        userId: req.user?.id,
      });

      if (!food) {
        res.status(404).json({
          success: false,
          message: "Food not found",
        });
        return;
      }

      await Food.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Food deleted successfully",
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
