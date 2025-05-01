import dbConnect from "@/lib/dbConnect";

import { UserInfoModel } from "@/models/UserInfo";
import { auth ,clerkClient} from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'


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
        const userData = await req.json();
        

        const userInfo = await UserInfoModel.findOne({ email: email });
        
        if (!userInfo) {
            return Response.json({
                success: false,
                message: "User is not found in database",
            }, { status: 404 });
        }

        // Validate the fields being updated
        const allowedFields = ['fullName', 'professionTitle', 'bio', 'githubURL', 'portfolioURL', 'tone'];
        const updateData: { [key: string]: any } = {};
        for (const field of allowedFields) {
            if (userData[field] !== undefined) {
                updateData[field] = userData[field];
            }
        }

       

        // Update user data with validated content
        const updatedUser = await UserInfoModel.findOneAndUpdate(
            { email: email },
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "Failed to update user data",
            }, { status: 400 });
        }
            
        return Response.json({
            success: true,
            message: "Data updated successfully",
            data: updatedUser
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating user information:", error);
        return Response.json({
            success: false,
            message: "An unexpected error occurred while updating your profile",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}