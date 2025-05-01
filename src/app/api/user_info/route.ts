import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { UserInfoModel } from "@/models/UserInfo"
import { auth ,clerkClient} from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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

        // Check if user already exists and has userInfo
        const existingUser = await UserModel.findOne({ email }).populate('userInfo');
        
        if (existingUser?.userInfo) {
            return Response.json({
                success: false,
                message: "Profile already exists. Please use the update profile page to make changes.",
            }, { status: 400 });
        }

        // Get form data from request body
        const {
            fullName,
            professionTitle,
            linkedinURL,
            githubURL,
            portfolioURL,
            interests,
            bio,
            tone
        } = await request.json()

        try {

            const params = { firstName: fullName }

            const client = await clerkClient()

            const user = await client.users.updateUser(userId, params)

            // Create UserInfo document
            const userInfo = await UserInfoModel.create({
                email,
                fullName,
                professionTitle,
                linkedinURL,
                githubURL,
                portfolioURL,
                interests,
                bio,
                tone
            });

            // Create or update User document
            const userData = {
                email,
                username,
                userInfo: userInfo._id,
                credits: 5,
                subscriptionPlan: "Free"
            };

            let user_doc;
            if (existingUser) {
                // Update existing user with userInfo
                user_doc = await UserModel.findByIdAndUpdate(
                    existingUser._id,
                    { userInfo: userInfo._id },
                    { new: true }
                );
            } else {
                // Create new user
                user_doc = await UserModel.create(userData);
            }

            return Response.json({
                success: true,
                message: "Profile created successfully",
                data: {
                    user: user_doc,
                    userInfo
                }
            }, { status: 201 });

        } catch (error) {
            // If UserInfo creation fails, handle the error
            if (error instanceof Error) {
                if (error.message.includes('validation failed')) {
                    return Response.json({
                        success: false,
                        message: "Please check all required fields are filled correctly",
                    }, { status: 400 });
                }
                if (error.message.includes('duplicate key')) {
                    return Response.json({
                        success: false,
                        message: "A profile with this email already exists",
                    }, { status: 409 });
                }
            }
            throw error; // Rethrow other errors to be caught by outer catch block
        }

    } catch (error) {
        console.error("Error saving user information:", error);
        return Response.json({
            success: false,
            message: "An unexpected error occurred while creating your profile",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}