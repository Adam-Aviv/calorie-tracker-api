import request from "supertest";
import app from "../server";

/**
 * Helper to register a user and return token
 */
export const registerUser = async (
  email: string = "test@example.com",
  password: string = "password123",
  name: string = "Test User"
) => {
  const response = await request(app)
    .post("/api/auth/register")
    .send({ email, password, name });

  return {
    token: response.body.data.token,
    userId: response.body.data.id,
    user: response.body.data,
  };
};

/**
 * Helper to create a food
 */
export const createFood = async (
  token: string,
  foodData: any = {
    name: "Chicken Breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    servingSize: 100,
    servingUnit: "g",
    category: "protein",
  }
) => {
  const response = await request(app)
    .post("/api/foods")
    .set("Authorization", `Bearer ${token}`)
    .send(foodData);

  return response.body.data;
};

/**
 * Helper to create a food log
 */
export const createFoodLog = async (
  token: string,
  foodId: string,
  logData: any = {
    date: "2025-12-06",
    mealType: "breakfast",
    servings: 1,
  }
) => {
  const response = await request(app)
    .post("/api/logs")
    .set("Authorization", `Bearer ${token}`)
    .send({
      foodId,
      ...logData,
    });

  return response.body.data;
};

/**
 * Helper to create a weight entry
 */
export const createWeightEntry = async (
  token: string,
  weightData: any = {
    weight: 75,
    date: "2025-12-06",
    notes: "Test entry",
  }
) => {
  const response = await request(app)
    .post("/api/weight")
    .set("Authorization", `Bearer ${token}`)
    .send(weightData);

  return response.body.data;
};
