import mongoose, { Schema, Document } from "mongoose";
import { UserInfo } from "./UserInfo";

export interface User extends Document {
    email: string;
    username : string;
    userInfo?: UserInfo;
    credits: number;
    lastCreditReset?: Date;
    linkedToken?: string;
    linkedTokenId?: string;
    linkedTokenExpDate?: Date;
    subscriptionPlan: "Free" | "Premium";
}

const userSchema = new Schema<User>({
    email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true, 
        match: [/.+@.+\..+/, "Please enter a valid email address"]
    },
    username : {
      type: String,
      required : true,
      unique : true,
    },
    userInfo: { type: Schema.Types.ObjectId, ref: "UserInfo" },
    credits: { type: Number, default: 5 },
    lastCreditReset: { type: Date },
    linkedToken: { 
        type: String
    },
    linkedTokenId: { 
        type: String
    },
    linkedTokenExpDate: { type: Date },
    subscriptionPlan: { type: String, enum: ["Free", "Premium"], default: "Free" }
}, { timestamps: true });

// Add middleware to check and reset credits on the first of each month
userSchema.pre('save', function(next) {
    const today = new Date();
    if (today.getDate() === 1) {
        this.credits = 5;
    }
    next();
});

export const UserModel = mongoose.models.User || mongoose.model<User>("User", userSchema);