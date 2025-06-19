import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import * as dotenv from 'dotenv';
import { Role } from "@entities/Role";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/roles", async (req, res) => {
  const roles = await AppDataSource.getRepository(Role).find();
  res.json(roles);
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized and SQLite DB connected!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

//-----basic server------
// app.listen(PORT, () => {
//   console.log(`Server running without DB on port ${PORT}`);
// });