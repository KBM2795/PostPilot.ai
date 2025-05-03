import dbConnect from "@/lib/dbConnect";

import { UserInfoModel } from "@/models/UserInfo";
import { UserModel } from "@/models/User";
import { PostModel } from "@/models/Post";
import { auth, clerkClient } from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'
import axios from "axios";


export async function POST(req: Request) {
    try {
        await dbConnect();

        const { userId } = await auth()

        if (!userId) {
            return Response.json({
                success: false,
                message: "You must be logged in to complete your profile",
            }, { status: 401 });
        }

        // Get user data from Clerk
        const user = await currentUser()
        const email = user?.emailAddresses[0]?.emailAddress;
        const username = user?.username;

        if (!email || !username) {
            return Response.json({
                success: false,
                message: "Unable to retrieve your email or username",
            }, { status: 400 });
        }

        // Get data from request body
        const promptData = await req.json();
        const userDB = await UserModel.findOne({ email: email });
        const userInfo = await UserInfoModel.findOne({ email: email });

        if (!userInfo || !userDB) {
            return Response.json({
                success: false,
                message: "User is not found in database",
            }, { status: 404 });
        }

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        if (!userDB.lastCreditReset ||
            userDB.lastCreditReset.getMonth() !== currentMonth ||
            userDB.lastCreditReset.getFullYear() !== currentYear) {

            userDB.credits = 5;
            userDB.lastCreditReset = today;
            await userDB.save();
        }
        
        if (!userDB.credits || userDB.credits <= 0) {
            return Response.json({
                success: false,
                message: "You have no credits left",
            }, { status: 400 });
        }
        // Validate the fields being updated

        const data = {
            user_id: userDB._id,
            email: email,
            topic: promptData.topic,
            additional_info: promptData.overview,
            preferred_tone: userInfo.tone,
            media_type: ["text", "image"],
            inspiration_link: promptData.referenceUrl,
        }

        try {
            const n8n_create = process.env.n8n_create!;
            const axiosResponse = await axios.post(n8n_create, data)

            console.log("Response from n8n:", axiosResponse);

            if (!axiosResponse) {
                return Response.json({
                    success: false,
                    message: "AI limit reached, please try again tomorrow",
                }, { status: 404 });
            }


            const postData = axiosResponse.data[0];
            const post = await PostModel.create({
                userId: userDB._id,
                prompt: {
                    topic: promptData.topic,
                    additional_info: promptData.overview,
                    inspiration_link: promptData.referenceUrl,
                },
                postVersions: [{
                    version: 1,
                    content: postData
                }]
            });

            const postId = post._id;

            const userCredits = userDB.credits - 1;

            const updatedUser = await UserModel.findOneAndUpdate(
                { email: email },
                { $set: { credits: userCredits } },
                { new: true }
            );

            if (!updatedUser) {
                return Response.json({
                    success: false,
                    message: "Failed to update user credits",
                }, { status: 400 });
            }


            return Response.json({
                success: true,
                message: "Post created successfully",
                data: postId,
            }, { status: 200 });

        } catch (error) {
            console.error("Error validating fields:", error);
            return Response.json({
                success: false,
                message: "error generating post by ai agent",
                error: error instanceof Error ? error.message : "Unknown error"
            }, { status: 400 });
        }



    } catch (error) {
        console.error("Error updating user information:", error);
        return Response.json({
            success: false,
            message: "An unexpected error occurred while creating a post",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}