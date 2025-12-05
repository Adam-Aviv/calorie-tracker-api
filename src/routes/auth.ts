import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User";
import { generateToken, protect } from "../moddleware/auth";
import { IAuthRequest, IRegisterInput, ILoginInput } from "../types";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("name").notEmpty().withMessage("Name is required"),
  ],
  async (
    req: Request<{}, {}, IRegisterInput>,
    res: Response
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        });
        return;
      }
      const { email, password, name } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      const user = await User.create({
        email,
        password,
        name,
      });

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          token,
        },
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: "Server error during registartion",
        error: err.message,
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req: Request<{}, {}, ILoginInput>, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        });
        return;
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("password");

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      const token = generateToken(user._id);

      res.json({
        succes: true,
        data: {
          id: {
            id: user._id,
            name: user.name,
            email: user.email,
            token,
          },
        },
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        success: false,
        message: "Server error during login",
        error: err.message,
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access Private
router.get(
  "/me",
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

export default router;
