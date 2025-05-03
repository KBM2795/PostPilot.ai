// /pages/api/linkedin/callback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import dbConnect from '@/lib/dbConnect';
import { UserModel } from '@/models/User'; // Adjust the import path as necessary
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { log } from 'node:console';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  // Build a URLSearchParams and then stringify it
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', process.env.NEXT_PUBLIC_REDIRECT_URI!);
  params.append('client_id', process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!);
  params.append('client_secret', process.env.LINKEDIN_CLIENT_SECRET!);

  let tokenRes;
  try {
    tokenRes = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      params.toString(),                        // <<< must be string
      { headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        } 
      }
    );
  } catch (err: any) {
    console.error('LinkedIn token error:', err.response?.data || err.message);
    return NextResponse.json(
      { error: 'Failed to exchange code', details: err.response?.data },
      { status: 500 }
    );
  }

  const accessToken = tokenRes.data.access_token;
  const idToken = tokenRes.data.id_token;

  console.log(idToken);
  
  
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

  if (!User) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

 

  // Update the user with both LinkedIn tokens and expiration date
  User.linkedToken = accessToken;
  User.linkedTokenId = idToken;
  User.linkedTokenExpDate = new Date(Date.now() + tokenRes.data.expires_in * 1000);

  try {
    await User.save();
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save tokens' }, { status: 500 });
  }

  console.log("LinkedIn tokens saved successfully");
  
  return NextResponse.redirect(new URL('/profile', req.url));
}
