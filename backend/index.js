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

app.use(cors({
    origin: ["http://localhost:3000"],//http://localhost:5000
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
}));

connectToDB();

//import bodyParser from "body-parser";
app.use(json({limit: "50mb"}));
app.use(urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));


app.use(authRoutes);
app.use(entryRoutes);

app.listen(port, () => {
    // perform a database connection when server starts
    
    handleDisconnectDB();

    console.log(`Server is running on port: ${port}`);
});