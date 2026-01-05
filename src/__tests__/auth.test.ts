import request from "supertest";
import app from "../server";

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.email).toBe("newuser@example.com");
      expect(response.body.data.name).toBe("New User");
    });

    it("should not register user with duplicate email", async () => {
      // First registration
      await request(app).post("/api/auth/register").send({
        email: "duplicate@example.com",
        password: "password123",
        name: "User One",
      });

      // Duplicate registration
      const response = await request(app).post("/api/auth/register").send({
        email: "duplicate@example.com",
        password: "password123",
        name: "User Two",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });

    it("should validate email format", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "invalid-email",
        password: "password123",
        name: "Test User",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("should validate password length", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "12345", // Too short
        name: "Test User",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should require name field", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
        // Missing name
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Register user before each login test
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
          email: "logintest@example.com",
          password: "password123",
          name: "Login Test User",
        });

      // Verify registration succeeded
      expect(registerResponse.status).toBe(201);
    });

    it("should login with correct credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "logintest@example.com",
        password: "password123",
      });

      // Debug: Log the response if it fails
      if (response.status !== 200) {
        console.log("Login failed:", response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data.email).toBe("logintest@example.com");
    });

    it("should not login with wrong password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "logintest@example.com",
        password: "wrongpassword",
      });

      // Debug: Log the response if it's not 401
      if (response.status !== 401) {
        console.log("Wrong password test failed:", response.body);
      }

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should not login with non-existent email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should validate required fields", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        // Missing password
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    let token: string;

    beforeEach(async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "metest@example.com",
        password: "password123",
        name: "Me Test User",
      });

      token = response.body.data.token;
    });

    it("should get current user with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe("metest@example.com");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("should not get user without token", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should not get user with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid_token_here");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
