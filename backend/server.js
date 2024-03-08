import dotenv from "dotenv";
dotenv.config();

// Register models
import "./models/entry.js"
import "./models/subentry.js"

import express, { json, urlencoded } from "express";
import cors from "cors";
import { connectToDB, handleDisconnectDB } from "./db/conn.js";

import authRoutes from "./routes/authRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

app.use(authRoutes);
app.use(entryRoutes);

app.listen(port, () => {
    // perform a database connection when server starts
    connectToDB();
    handleDisconnectDB();

    console.log(`Server is running on port: ${port}`);
});