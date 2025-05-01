import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { PostModel } from "@/models/Post";
import { auth ,clerkClient} from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'


export async function GET() {
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

        

        const User = await UserModel.findOne({ email: email });
       
        
        if (!User ) {
            return Response.json({
                success: false,
                message: "User is not there in DataBase",
            }, { status: 400 });
        }

        const posts = await PostModel.find({ userId: User._id }).sort({ createdAt: -1 });
            
            return Response.json({
                success: true,
                message: "posts fetched successfully",
                data: posts,
            }, { status: 201 });


    } catch (error) {
        console.error("Error saving user information:", error);
        return Response.json({
            success: false,
            message: "An unexpected error occurred while fetching your posts",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}