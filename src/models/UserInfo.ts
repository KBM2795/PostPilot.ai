import mongoose, { Schema, Document } from "mongoose";

export interface UserInfo extends Document {
    email : string ;
    fullName: string;
    professionTitle: string;
    linkedinURL: string;
    githubURL?: string;
    portfolioURL?: string;
    interests: string[];
    bio: string;
    tone: "Formal" | "Friendly" | "Inspirational" | "Educational";
}

const userInfoSchema = new Schema<UserInfo>({
    email : { type: String, required: true },
    fullName: { type: String, required: true },
    professionTitle: { type: String, required: true },
    linkedinURL: { type: String, required: true },
    githubURL: { type: String },
    portfolioURL: { type: String },
    interests: [{ type: String }],
    bio: { type: String, required: true },
    tone: { 
        type: String, 
        enum: ["Formal", "Friendly", "Inspirational", "Educational"],
        default: "Friendly" 
    }
});

export const UserInfoModel = mongoose.models.UserInfo || mongoose.model<UserInfo>("UserInfo", userInfoSchema);