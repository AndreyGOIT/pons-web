//server/tests/admin/admin-auth.test.ts

import request from "supertest";
import app from "../../src/app";
import { createTestToken } from "../setup/testToken";

describe("Admin authorization", () => {
  it("should deny access without token", async () => {
    const response = await request(app).get("/api/admin/users");

    expect(response.status).toBe(401);

    expect(response.body).toMatchObject({
      message: "No token provided",
    });
  });

  it("should deny access for non-admin user", async () => {
    const token = createTestToken("CLIENT");

    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });
});
