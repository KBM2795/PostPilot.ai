import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase";


const connection: ConnectionObject = {};  


async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("MongoDB is already connected.");
        return;
    }

    try {
        const DB = await mongoose.connect(MONGODB_URI);
        
        connection.isConnected = DB.connections[0].readyState;

        console.log("MongoDB connected successfully.");

    } catch (error) {
        console.log("MongoDB connection failed error:", error);
        process.exit(1);
    }

}

export default dbConnect;

