import dbConnect from "@/lib/dbConnect";
import { UserInfoModel } from "@/models/UserInfo";
import { UserModel } from "@/models/User";
import { PostModel } from "@/models/Post";
import { auth ,clerkClient} from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'
import axios from "axios";

export async function POST(req : Request) {
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

        // Get existing post data if updating
        const existingPost = await PostModel.findById(promptData.postId);
        const lastVersion = existingPost?.postVersions?.slice(-1)[0]?.content || null;

        const data = {
            email: email,
            prompt: promptData.editConfig.prompt,
            Post_text: promptData.postText,
            image_edit: promptData.editConfig.type === "image" || promptData.editConfig.type === "both" ? true : false,
            post_edit: promptData.editConfig.type === "text" || promptData.editConfig.type === "both" ? true : false,
        }

        try {
            const n8n_edit = process.env.n8n_edit!;
            const axiosResponse = await axios.post(n8n_edit, data)

            if (!axiosResponse) {
                return Response.json({
                    success: false,
                    message: "Error editing post by ai agent",
                }, { status: 404 });
            }

            console.log(axiosResponse);
            
            const aiResponse = axiosResponse.data;
            console.log(aiResponse);
            
            // Prepare new content maintaining previous data where needed
            const newContent = {
                text: promptData.editConfig.type === "text" || promptData.editConfig.type === "both" 
                    ? aiResponse.output || aiResponse.text
                    : lastVersion?.text || "",
                image_url: promptData.editConfig.type === "image" || promptData.editConfig.type === "both"
                    ? aiResponse.image_url
                    : lastVersion?.image_url || "",
                image_id: promptData.editConfig.type === "image" || promptData.editConfig.type === "both"
                    ? aiResponse.image_id
                    : lastVersion?.image_id || "",
                ai_agent_found: aiResponse.ai_agent_found || false
            };

            if (existingPost) {
                // Add new version to existing post
                const newVersion = {
                    version: (existingPost.postVersions?.length || 0) + 1,
                    content: newContent
                };

                const updatedPost = await PostModel.findByIdAndUpdate(
                    promptData.postId,
                    { 
                        $push: { postVersions: newVersion }
                    },
                    { new: true }
                );

                // Update user credits
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
                    message: "Post updated successfully",
                    data: updatedPost._id,
                }, { status: 200 });
            }

            // Create new post if it doesn't exist
            const post = await PostModel.create({
                userId: userDB._id,
                prompt: {
                    topic: promptData.topic,
                    additional_info: promptData.overview,
                    inspiration_link: promptData.referenceUrl,
                },
                postVersions: [{
                    version: 1,
                    content: newContent
                }]
            });

            // Update user credits
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
                data: post._id,
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
            message: "An unexpected error occurred while editing a post",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}