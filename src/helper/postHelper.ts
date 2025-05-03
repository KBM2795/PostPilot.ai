import axios from "axios";


export const getUserURN = async (access_token: string) => {
  
  
    const res = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    
    
    return res.data.sub;
  };


  export async function registerUpload(userURN: string, accessToken: string) {
    const registerRes = await axios.post(
      'https://api.linkedin.com/v2/assets?action=registerUpload',
      {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${userURN}`,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    const uploadUrl = registerRes?.data?.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
   
    const { asset } = registerRes.data.value;
    return { uploadUrl, asset };
  }


  export async function uploadImage(uploadUrl: string, fileBuffer: Buffer) {
    await axios.put(uploadUrl, fileBuffer, {
      headers: {
        'Content-Type': 'image/png', // or whatever type
      },
    });
  }


  export async function createImagePost(userURN: string, asset: string, accessToken: string, postText: string) {
    await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: `urn:li:person:${userURN}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: postText,
            },
            shareMediaCategory: 'IMAGE',
            media: [
              {
                status: 'READY',
                description: {
                  text: 'AI-generated visual',
                },
                media: asset, // This is the asset URN returned earlier
                title: {
                  text: 'PostPilot.ai',
                },
              },
            ],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
        },
      }
    );
  }