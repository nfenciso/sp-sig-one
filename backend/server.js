import dotenv from "dotenv";
dotenv.config();

// Register models
import "./models/entry.js"
import "./models/subentry.js"

import express, { json } from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(json());

//app.use(require("./routes/record"));

// get driver connection
import { connectToDB, handleDisconnectDB } from "./db/conn.js";

app.listen(port, () => {
    // perform a database connection when server starts
    connectToDB();
    handleDisconnectDB();

    console.log(`Server is running on port: ${port}`);
});