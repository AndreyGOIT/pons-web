require("dotenv").config();

module.exports = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ["dist/entities/**/*.js"],
  migrations: ["dist/migrations/**/*.js"],
  synchronize: false, // true только при отладке!
  logging: false,
};
