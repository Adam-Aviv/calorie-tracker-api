# 📘 TypeScript Types Cheat Sheet

Quick reference for all TypeScript types and interfaces used in this project.

## 🔐 Authentication Types

### IAuthRequest

Extended Express Request with user property:

```typescript
interface IAuthRequest extends Request {
  user?: IUser;
}
```

### Login/Register Input

```typescript
interface ILoginInput {
  email: string;
  password: string;
}

interface IRegisterInput {
  email: string;
  password: string;
  name: string;
}
```

### JWT Payload

```typescript
interface IJWTPayload {
  id: string;
  iat?: number;
  exp?: number;
}
```

## 👤 User Types

### IUser (Document)

```typescript
interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  currentWeight?: number;
  goalWeight?: number;
  height?: number;
  age?: number;
  gender: "male" | "female" | "other";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  dailyCalorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  calculateTDEE(): number | null;
}
```

### IUserInput

```typescript
interface IUserInput {
  email: string;
  password: string;
  name: string;
  currentWeight?: number;
  goalWeight?: number;
  height?: number;
  age?: number;
  gender?: "male" | "female" | "other";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  dailyCalorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatsGoal?: number;
}
```

### ITDEEResult

```typescript
interface ITDEEResult {
  tdee: number;
  bmr: number;
  recommendation: {
    maintain: number;
    mildWeightLoss: number;
    weightLoss: number;
    extremeWeightLoss: number;
  };
}
```

## 🍎 Food Types

### IFood (Document)

```typescript
interface IFood extends Document {
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
    | "vegetables"
    | "fruits"
    | "dairy"
    | "snacks"
    | "drinks"
    | "other";
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### IFoodInput

```typescript
interface IFoodInput {
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
    | "vegetables"
    | "fruits"
    | "dairy"
    | "snacks"
    | "drinks"
    | "other";
  isPublic?: boolean;
}
```

### IFoodQuery

```typescript
interface IFoodQuery {
  search?: string;
  category?: string;
  page?: string;
  limit?: string;
}
```

## 📊 Food Log Types

### IFoodLog (Document)

```typescript
interface IFoodLog extends Document {
  _id: string;
  userId: string;
  foodId: string;
  date: Date;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
  calories: number; // Snapshot at time of logging
  protein: number; // Snapshot at time of logging
  carbs: number; // Snapshot at time of logging
  fats: number; // Snapshot at time of logging
  foodName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### IFoodLogInput

```typescript
interface IFoodLogInput {
  foodId: string;
  date: string | Date;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
  notes?: string;
}
```

### ILogQuery

```typescript
interface ILogQuery {
  startDate?: string;
  endDate?: string;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
}
```

### IDailySummary

```typescript
interface IDailySummary {
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
```

## ⚖️ Weight Types

### IWeightHistory (Document)

```typescript
interface IWeightHistory extends Document {
  _id: string;
  userId: string;
  weight: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}
```

### IWeightInput

```typescript
interface IWeightInput {
  weight: number;
  date: string | Date;
  notes?: string;
}
```

### IWeightQuery

```typescript
interface IWeightQuery {
  startDate?: string;
  endDate?: string;
  limit?: string;
}
```

### IWeightTrend

```typescript
interface IWeightTrend {
  count: number;
  average: number;
  change: number;
  changePercentage: string;
}
```

## 📦 API Response Types

### IApiResponse

```typescript
interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}
```

### IPaginationResponse

```typescript
interface IPaginationResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}
```

## 🎯 Usage Examples

### Using Types in Routes

```typescript
import { IAuthRequest, IFoodInput } from "../types";

router.post(
  "/",
  protect,
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const foodInput: IFoodInput = req.body;
    const userId = req.user?.id;

    const food = await Food.create({
      ...foodInput,
      userId,
    });

    res.json({ success: true, data: food });
  }
);
```

### Using Model Methods

```typescript
const user = await User.findById(userId);
if (user) {
  const tdee: number | null = user.calculateTDEE();
  const isValid: boolean = await user.comparePassword(password);
}
```

### Type-Safe Queries

```typescript
const query: IFoodQuery = req.query;
const filters: any = { userId: req.user?.id };

if (query.category) {
  filters.category = query.category;
}

const foods: IFood[] = await Food.find(filters);
```

### Static Methods with Types

```typescript
// Get daily summary with type safety
const summary: IDailySummary = await FoodLog.getDailySummary(
  userId,
  "2025-11-17"
);

// Get weight trend
const weights: IWeightHistory[] = await WeightHistory.getWeightTrend(
  userId,
  30
);
```

## 💡 Best Practices

1. **Always import types**: `import { IUser, IFood } from '../types'`
2. **Use strict types**: Avoid `any` when possible
3. **Type function returns**: `async (...): Promise<void>`
4. **Type variables**: `const user: IUser = ...`
5. **Use optional chaining**: `req.user?.id`
6. **Type assertions carefully**: `as IUser` only when certain

## 🔍 Type Checking Tips

```typescript
// ✅ Good: Explicit types
const food: IFood = await Food.findById(id);

// ✅ Good: Type guard
if (req.user) {
  const userId: string = req.user.id;
}

// ✅ Good: Optional chaining
const weight = user?.currentWeight ?? 0;

// ❌ Avoid: any type
const data: any = req.body;

// ❌ Avoid: Non-null assertion without checking
const userId = req.user!.id;
```

## 📚 Learn More

- Check `src/types/index.ts` for all type definitions
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- Mongoose TypeScript: https://mongoosejs.com/docs/typescript.html

---

All types are exported from `src/types/index.ts` - import what you need!
