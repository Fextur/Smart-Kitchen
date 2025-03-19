import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import pg from "pg";

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders:
      "Content-Type, Authorization, Cross-Origin-Opener-Policy, same-origin-allow-popups",
    credentials: true,
  })
);

const pgClient = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: "postgres",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_POST,
});

pgClient
  .connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => console.error("Connection error", err.stack));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
