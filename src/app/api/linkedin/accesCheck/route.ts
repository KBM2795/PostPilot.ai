import { createImagePost, getUserURN, registerUpload, uploadImage } from "@/helper/postHelper";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { UserInfoModel } from "@/models/UserInfo";
import { auth ,clerkClient} from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'
import { jwtDecode } from "jwt-decode"




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

        

        const User = await UserModel.findOne({ email: email });
        const UserInfo = await UserInfoModel.findOne({ email: email });

        if (!User) {
            return Response.json({
                success: false,
                message: "User not found",
            }, { status: 404 });
        }

        if(!User.linkedToken || !User.linkedTokenExpDate || User.linkedTokenExpDate < new Date() || !User.linkedTokenId || User.linkedToken === "") {
            return Response.json({
                success: false,
                message: "Please Verify your LinkedIn account in Profile",
            }, { status: 404 });
        }

        const accessToken = User.linkedToken;
        const linkedTokenId = User.linkedTokenId;

         const postData = await req.json();
         const decode = jwtDecode(linkedTokenId);
         const userURN = decode.sub;
        console.log(decode);
        
         console.log(userURN);

         if (!userURN) {
            return Response.json({
                success: false,
                message: "Invalid LinkedIn token",
            }, { status: 400 });
         }

         const { uploadUrl , asset } = await registerUpload(userURN, accessToken);


         const resp = await fetch(postData.content.image_url);
         const arrayBuffer = await resp.arrayBuffer();
         const imageBuffer = Buffer.from(arrayBuffer);
 
         try {

            await uploadImage(uploadUrl,imageBuffer);

            console.log("Image uploaded successfully");
            await createImagePost(userURN, asset, accessToken, postData.content.text);
    
            console.log("Post created successfully");
            return Response.json({
                success: true,
                message: "Post created successfully",
                data: {
                   linkedin_url: UserInfo?.linkedinURL,
                },
            }, { status: 200 });
            
         } catch (error) {
            console.error("Error saving user information:", error);
            return Response.json({
                success: false,
                message: "An unexpected error occurred while posting user final Post",
                error: error instanceof Error ? error.message : "Unknown error"
            }, { status: 500 });
         }
         
        

    } catch (error) {
        console.error("Error saving user information:", error);
        return Response.json({
            success: false,
            message: "An unexpected error occurred while posting user Post",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

