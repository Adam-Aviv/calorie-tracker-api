import request from "supertest";
import app from "../server";
import { registerUser, createFood, createFoodLog } from "./helpers";

describe("Food Logs API", () => {
  let token: string;
  let foodId: string;

  beforeEach(async () => {
    const user = await registerUser();
    token = user.token;

    const food = await createFood(token, {
      name: "Chicken Breast",
      calories: 165,
      protein: 31,
      carbs: 0,
      fats: 3.6,
      servingSize: 100,
      servingUnit: "g",
      category: "protein",
    });
    foodId = food._id;
  });

  describe("POST /api/logs", () => {
    it("should create a food log", async () => {
      const response = await request(app)
        .post("/api/logs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          foodId,
          date: "2025-12-06",
          mealType: "breakfast",
          servings: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.calories).toBe(165);
      expect(response.body.data.protein).toBe(31);
      expect(response.body.data.foodName).toBe("Chicken Breast");
    });

    it("should calculate nutritional values based on servings", async () => {
      const response = await request(app)
        .post("/api/logs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          foodId,
          date: "2025-12-06",
          mealType: "breakfast",
          servings: 1.5,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.calories).toBe(247.5); // 165 * 1.5
      expect(response.body.data.protein).toBe(46.5); // 31 * 1.5
      expect(response.body.data.carbs).toBe(0);
      expect(response.body.data.fats).toBe(5.4); // 3.6 * 1.5
    });

    it("should validate meal type", async () => {
      const response = await request(app)
        .post("/api/logs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          foodId,
          date: "2025-12-06",
          mealType: "brunch", // Invalid
          servings: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should require authentication", async () => {
      const response = await request(app).post("/api/logs").send({
        foodId,
        date: "2025-12-06",
        mealType: "breakfast",
        servings: 1,
      });

      expect(response.status).toBe(401);
    });

    it("should return 404 for non-existent food", async () => {
      const response = await request(app)
        .post("/api/logs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          foodId: "000000000000000000000000",
          date: "2025-12-06",
          mealType: "breakfast",
          servings: 1,
        });

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/logs/daily/:date", () => {
    beforeEach(async () => {
      // Create multiple logs
      await createFoodLog(token, foodId, {
        date: "2025-12-06",
        mealType: "breakfast",
        servings: 1,
      });

      await createFoodLog(token, foodId, {
        date: "2025-12-06",
        mealType: "lunch",
        servings: 1.5,
      });

      await createFoodLog(token, foodId, {
        date: "2025-12-06",
        mealType: "dinner",
        servings: 1,
      });

      // Different day (should not appear)
      await createFoodLog(token, foodId, {
        date: "2025-12-05",
        mealType: "breakfast",
        servings: 1,
      });
    });

    it("should get daily summary", async () => {
      const response = await request(app)
        .get("/api/logs/daily/2025-12-06")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.logs).toHaveLength(3);
      expect(response.body.data.summary).toBeDefined();
    });

    it("should calculate correct totals", async () => {
      const response = await request(app)
        .get("/api/logs/daily/2025-12-06")
        .set("Authorization", `Bearer ${token}`);

      const summary = response.body.data.summary;

      // 165 + 247.5 + 165 = 577.5
      expect(summary.totalCalories).toBe(577.5);

      // 31 + 46.5 + 31 = 108.5
      expect(summary.totalProtein).toBe(108.5);
    });

    it("should breakdown by meal type", async () => {
      const response = await request(app)
        .get("/api/logs/daily/2025-12-06")
        .set("Authorization", `Bearer ${token}`);

      const breakdown = response.body.data.summary.mealBreakdown;

      expect(breakdown.breakfast.count).toBe(1);
      expect(breakdown.breakfast.calories).toBe(165);

      expect(breakdown.lunch.count).toBe(1);
      expect(breakdown.lunch.calories).toBe(247.5);

      expect(breakdown.dinner.count).toBe(1);
      expect(breakdown.dinner.calories).toBe(165);

      expect(breakdown.snack.count).toBe(0);
    });

    it("should return empty for date with no logs", async () => {
      const response = await request(app)
        .get("/api/logs/daily/2025-12-10")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.logs).toHaveLength(0);
      expect(response.body.data.summary.totalCalories).toBe(0);
    });
  });

  describe("GET /api/logs", () => {
    beforeEach(async () => {
      await createFoodLog(token, foodId, {
        date: "2025-12-06",
        mealType: "breakfast",
        servings: 1,
      });

      await createFoodLog(token, foodId, {
        date: "2025-12-07",
        mealType: "lunch",
        servings: 1,
      });
    });

    it("should get all logs", async () => {
      const response = await request(app)
        .get("/api/logs")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it("should filter by date range", async () => {
      const response = await request(app)
        .get("/api/logs?startDate=2025-12-06&endDate=2025-12-06")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it("should filter by meal type", async () => {
      const response = await request(app)
        .get("/api/logs?mealType=breakfast")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].mealType).toBe("breakfast");
    });
  });

  describe("PUT /api/logs/:id", () => {
    let logId: string;

    beforeEach(async () => {
      const log = await createFoodLog(token, foodId);
      logId = log._id;
    });

    it("should update food log", async () => {
      const response = await request(app)
        .put(`/api/logs/${logId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          servings: 2,
          notes: "Updated portion",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.servings).toBe(2);
      expect(response.body.data.calories).toBe(330); // Recalculated
    });

    it("should not update other users log", async () => {
      const user2 = await registerUser("user2@example.com");

      const response = await request(app)
        .put(`/api/logs/${logId}`)
        .set("Authorization", `Bearer ${user2.token}`)
        .send({
          servings: 2,
        });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/logs/:id", () => {
    let logId: string;

    beforeEach(async () => {
      const log = await createFoodLog(token, foodId);
      logId = log._id;
    });

    it("should delete food log", async () => {
      const response = await request(app)
        .delete(`/api/logs/${logId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/logs/summary/:startDate/:endDate", () => {
    beforeEach(async () => {
      await createFoodLog(token, foodId, {
        date: "2025-12-06",
        mealType: "breakfast",
        servings: 1,
      });

      await createFoodLog(token, foodId, {
        date: "2025-12-07",
        mealType: "lunch",
        servings: 1.5,
      });
    });

    it("should get date range summary", async () => {
      const response = await request(app)
        .get("/api/logs/summary/2025-12-06/2025-12-07")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalCalories).toBe(412.5); // 165 + 247.5
      expect(response.body.data.count).toBe(2);
    });
  });
});
