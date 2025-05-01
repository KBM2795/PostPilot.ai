
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { PostModel } from "@/models/Post";
import { auth ,clerkClient} from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'




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

        

        const User = await UserModel.findOne({ email: email });
       
        
        if (!User ) {
            return Response.json({
                success: false,
                message: "User is not there in DataBase",
            }, { status: 400 });
        }
        
        const { searchParams } = new URL(request.url);
        const ID = searchParams.get('ID');

        
        if (!ID) {
            return Response.json({
                success: false,
                message: "Post ID is required",
            }, { status: 400 });
        }
        
        const post = await PostModel.findOneAndDelete({ _id: ID });

        if (!post) {
            return Response.json({
                success: false,
                message: "Post not found",
            }, { status: 404 });
        }
            
            return Response.json({
                success: true,
                message: "posts Deleted successfully",
            }, { status: 201 });


    } catch (error) {
        console.error("Error saving user information:", error);
        return Response.json({
            success: false,
            message: "An unexpected error occurred while Deleting your post",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}


