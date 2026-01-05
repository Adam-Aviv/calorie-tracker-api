import request from "supertest";
import app from "../server";
import { registerUser, createFood } from "./helpers";

describe("Foods API", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const user = await registerUser();
    token = user.token;
    userId = user.userId;
  });

  describe("POST /api/foods", () => {
    it("should create a new food", async () => {
      const response = await request(app)
        .post("/api/foods")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Chicken Breast",
          calories: 165,
          protein: 31,
          carbs: 0,
          fats: 3.6,
          servingSize: 100,
          servingUnit: "g",
          category: "protein",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data.name).toBe("Chicken Breast");
      expect(response.body.data.calories).toBe(165);
      expect(response.body.data.userId).toBe(userId);
    });

    it("should create food with default values", async () => {
      const response = await request(app)
        .post("/api/foods")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Simple Food",
          calories: 100,
          protein: 10,
          carbs: 10,
          fats: 5,
          servingSize: 100,
          servingUnit: "g",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.category).toBe("other");
      expect(response.body.data.isPublic).toBe(false);
    });

    it("should require authentication", async () => {
      const response = await request(app).post("/api/foods").send({
        name: "Test Food",
        calories: 100,
        protein: 10,
        carbs: 10,
        fats: 5,
        servingSize: 100,
        servingUnit: "g",
      });

      expect(response.status).toBe(401);
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/foods")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Invalid Food",
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("GET /api/foods", () => {
    beforeEach(async () => {
      // Create test foods
      await createFood(token, {
        name: "Chicken Breast",
        calories: 165,
        protein: 31,
        carbs: 0,
        fats: 3.6,
        servingSize: 100,
        servingUnit: "g",
        category: "protein",
      });

      await createFood(token, {
        name: "Brown Rice",
        calories: 112,
        protein: 2.6,
        carbs: 24,
        fats: 0.9,
        servingSize: 100,
        servingUnit: "g",
        category: "carbs",
      });

      await createFood(token, {
        name: "Banana",
        calories: 89,
        protein: 1.1,
        carbs: 23,
        fats: 0.3,
        servingSize: 1,
        servingUnit: "medium",
        category: "fruits",
      });
    });

    it("should get all user foods", async () => {
      const response = await request(app)
        .get("/api/foods")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    it("should search foods by name", async () => {
      const response = await request(app)
        .get("/api/foods?search=chicken")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe("Chicken Breast");
    });

    it("should filter by category", async () => {
      const response = await request(app)
        .get("/api/foods?category=protein")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe("protein");
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/foods?page=1&limit=2")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it("should not return other users foods", async () => {
      // Create second user
      const user2 = await registerUser("user2@example.com");

      // User 2 creates a food
      await createFood(user2.token, {
        name: "User 2 Food",
        calories: 100,
        protein: 10,
        carbs: 10,
        fats: 5,
        servingSize: 100,
        servingUnit: "g",
      });

      // User 1 gets their foods
      const response = await request(app)
        .get("/api/foods")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3); // Only their 3 foods
      expect(
        response.body.data.every((f: any) => f.name !== "User 2 Food")
      ).toBe(true);
    });
  });

  describe("GET /api/foods/:id", () => {
    let foodId: string;

    beforeEach(async () => {
      const food = await createFood(token);
      foodId = food._id;
    });

    it("should get single food by id", async () => {
      const response = await request(app)
        .get(`/api/foods/${foodId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(foodId);
    });

    it("should return 404 for non-existent food", async () => {
      const response = await request(app)
        .get("/api/foods/000000000000000000000000")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/foods/:id", () => {
    let foodId: string;

    beforeEach(async () => {
      const food = await createFood(token);
      foodId = food._id;
    });

    it("should update food", async () => {
      const response = await request(app)
        .put(`/api/foods/${foodId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Grilled Chicken Breast",
          calories: 170,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Grilled Chicken Breast");
      expect(response.body.data.calories).toBe(170);
    });

    it("should not update other users food", async () => {
      const user2 = await registerUser("user2@example.com");

      const response = await request(app)
        .put(`/api/foods/${foodId}`)
        .set("Authorization", `Bearer ${user2.token}`)
        .send({
          name: "Hacked Food",
        });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/foods/:id", () => {
    let foodId: string;

    beforeEach(async () => {
      const food = await createFood(token);
      foodId = food._id;
    });

    it("should delete food", async () => {
      const response = await request(app)
        .delete(`/api/foods/${foodId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/foods/${foodId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });

    it("should not delete other users food", async () => {
      const user2 = await registerUser("user2@example.com");

      const response = await request(app)
        .delete(`/api/foods/${foodId}`)
        .set("Authorization", `Bearer ${user2.token}`);

      expect(response.status).toBe(404);
    });
  });
});
