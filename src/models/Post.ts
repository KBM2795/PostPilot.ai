import mongoose, { Schema, Document } from "mongoose";

interface PostVersion {
    version: number;
    content: {};
    createdAt: Date;
}


export interface Post extends Document {
    userId: mongoose.Types.ObjectId;
    prompt: {}
    postVersions: PostVersion[];
}

const postVersionSchema = new Schema<PostVersion>({
    version: { type: Number, required: true },
    content: { type: {} , required: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new Schema<Post>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: {} },
    postVersions: [postVersionSchema]
}, { timestamps: true });

export const PostModel = mongoose.models.Post || mongoose.model<Post>("Post", postSchema);