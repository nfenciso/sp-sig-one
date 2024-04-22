import dotenv from "dotenv";
dotenv.config();

import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

async function connectToDB() {
    console.log("Connecting to DB...");
    try {
      await mongoose.connect(uri);
      console.log("Successfully connected to MongoDB!")
    } 
    catch (err) {
      console.log(err);
    }
}

// https://stackoverflow.com/questions/36979146/is-a-connection-to-mongodb-automatically-closed-on-process-exit
// Create a function to terminate your app gracefully:
function gracefulShutdown(){
    // First argument is [force], see mongoose doc.
    mongoose.connection.close(false);
    console.log('MongoDB connection closed.');
  };
  
  function handleDisconnectDB() {
    // This will handle process.exit():
    process.on('exit', gracefulShutdown);
  
    // This will handle kill commands, such as CTRL+C:
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGKILL', gracefulShutdown);
  
    // This will prevent dirty exit on code-fault crashes:
    process.on('uncaughtException', gracefulShutdown);
  }

export { connectToDB, handleDisconnectDB };