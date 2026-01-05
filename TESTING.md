# 🧪 Testing Guide

## Running Tests

### Install Dependencies First

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Watch Mode (Auto-rerun on changes)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Verbose Output

```bash
npm run test:verbose
```

---

## Test Structure

```
src/__tests__/
├── setup.ts           # Test configuration & database setup
├── helpers.ts         # Reusable test utilities
├── auth.test.ts       # Authentication tests
├── foods.test.ts      # Foods API tests
└── logs.test.ts       # Food logs API tests
```

---

## What's Being Tested

### ✅ Auth API (`auth.test.ts`)

- ✅ User registration (success, duplicate email, validation)
- ✅ User login (correct/incorrect credentials)
- ✅ Get current user (with/without token)
- ✅ Token validation

### ✅ Foods API (`foods.test.ts`)

- ✅ Create food (all fields, defaults, validation)
- ✅ Get all foods (pagination, search, category filter)
- ✅ Get single food (success, not found)
- ✅ Update food (success, partial update)
- ✅ Delete food (success, not found)
- ✅ User isolation (can't access other users' foods)

### ✅ Food Logs API (`logs.test.ts`)

- ✅ Create food log (automatic calculation)
- ✅ Get daily summary (totals, breakdown by meal)
- ✅ Get logs (all, date range, meal type filter)
- ✅ Update log (recalculation on servings change)
- ✅ Delete log
- ✅ Date range summary

---

## Test Utilities (`helpers.ts`)

Reusable functions to make tests cleaner:

```typescript
// Register a user and get token
const { token, userId } = await registerUser();

// Create a food
const food = await createFood(token, { name: 'Chicken', calories: 165, ... });

// Create a food log
const log = await createFoodLog(token, foodId, { mealType: 'breakfast', servings: 1 });

// Create weight entry
const weight = await createWeightEntry(token, { weight: 75, date: '2025-12-06' });
```

---

## In-Memory Database

Tests use `mongodb-memory-server` which:

- ✅ Creates temporary MongoDB instance
- ✅ No need for separate test database
- ✅ Fast and isolated
- ✅ Automatically cleaned up after tests

---

## Writing New Tests

### Example Test Structure

```typescript
import request from "supertest";
import app from "../server";
import { registerUser, createFood } from "./helpers";

describe("Your Feature", () => {
  let token: string;

  beforeEach(async () => {
    // Setup runs before each test
    const user = await registerUser();
    token = user.token;
  });

  it("should do something", async () => {
    const response = await request(app)
      .post("/api/your-endpoint")
      .set("Authorization", `Bearer ${token}`)
      .send({ data: "value" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## Test Coverage

After running `npm run test:coverage`, check the `coverage/` folder:

```
coverage/
├── lcov-report/       # HTML report (open index.html in browser)
└── lcov.info          # Machine-readable format
```

**Goal:** Aim for >80% coverage on critical paths

---

## Common Test Patterns

### Testing Success Cases

```typescript
it("should create resource", async () => {
  const response = await request(app)
    .post("/api/resource")
    .set("Authorization", `Bearer ${token}`)
    .send(validData);

  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);
  expect(response.body.data).toHaveProperty("_id");
});
```

### Testing Validation Errors

```typescript
it("should validate required fields", async () => {
  const response = await request(app)
    .post("/api/resource")
    .set("Authorization", `Bearer ${token}`)
    .send({}); // Missing fields

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.errors).toBeDefined();
});
```

### Testing Authentication

```typescript
it("should require authentication", async () => {
  const response = await request(app).get("/api/protected-route");
  // No Authorization header

  expect(response.status).toBe(401);
});
```

### Testing User Isolation

```typescript
it("should not access other users data", async () => {
  const user1 = await registerUser("user1@example.com");
  const user2 = await registerUser("user2@example.com");

  const resource = await createResource(user1.token);

  const response = await request(app)
    .get(`/api/resource/${resource._id}`)
    .set("Authorization", `Bearer ${user2.token}`);

  expect(response.status).toBe(404);
});
```

---

## Debugging Tests

### Run Single Test File

```bash
npm test auth.test.ts
```

### Run Single Test

```bash
npm test -- -t "should register a new user"
```

### See Console Logs

```bash
npm test -- --verbose
```

---

## CI/CD Integration

Tests automatically run on:

- ✅ Every push to GitHub
- ✅ Every pull request
- ✅ Before deployment

See `.github/workflows/test.yml` for configuration.

---

## Best Practices

1. ✅ **Isolate tests** - Each test should be independent
2. ✅ **Use beforeEach** - Set up fresh state for each test
3. ✅ **Test edge cases** - Not just happy paths
4. ✅ **Meaningful names** - Test names should describe what they test
5. ✅ **One assertion focus** - Each test should verify one thing
6. ✅ **Use helpers** - Don't repeat setup code
7. ✅ **Clean up** - `afterEach` handles this automatically

---

## Troubleshooting

### Tests Hanging

- Check `testTimeout` in `jest.config.js`
- Make sure database connections are closed

### Random Failures

- Tests might be affecting each other
- Check that `afterEach` is cleaning up properly

### Port Already in Use

- Tests use in-memory DB, no ports needed
- If server is running separately, stop it

### Memory Issues

- Clear `node_modules/.cache/ts-jest`
- Restart Jest with `--no-cache`

---

## What's Next?

Add tests for:

- [ ] Weight tracking API
- [ ] User profile updates
- [ ] TDEE calculation
- [ ] Edge cases and error conditions
- [ ] Performance tests for large datasets

---

**Happy Testing! 🎉**
