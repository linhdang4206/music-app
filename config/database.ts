import mongoose from "mongoose";

export const connect = async (): Promise<void> => {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
        throw new Error("MONGO_URL is not defined");
    }

    try {
        await mongoose.connect(mongoUrl);
        console.log("Connect Success");
    } catch (error) {
        console.error("Connect Error", error);
        throw error;
    }
};
