// server/tests/setup/testToken.ts

import jwt from "jsonwebtoken";

export const createTestToken = (role: string = "CLIENT") => {
  return jwt.sign(
    {
      id: 1,
      role,
      email: "test@example.com",
    },
    process.env.JWT_SECRET || "test-secret",
    {
      expiresIn: "1h",
    }
  );
};