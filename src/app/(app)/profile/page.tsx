"use client"

import type React from "react"
import axios from 'axios'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Check, Edit2, Save } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ApiResponse } from "@/types/ApiResponse"

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [credit , setCredit] = useState()
  const [userData, setUserData] = useState({
    fullName: "",
    professionTitle: "",
    linkedinURL: "",
    githubURL: "",
    portfolioURL: "",
    interests: [],
    bio: "",
    tone: "friendly",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get<ApiResponse>('/api/getUserData')
        console.log(response);
        
        if (response.data.success) {
          setUserData({
            fullName: response.data.data.userInfo.fullName,
            professionTitle: response.data.data.userInfo.professionTitle,
            linkedinURL: response.data.data.userInfo.linkedinURL,
            githubURL: response.data.data.userInfo.githubURL || "",
            portfolioURL: response.data.data.userInfo.portfolioURL || "",
            interests: response.data.data.userInfo.interests || [],
            bio: response.data.data.userInfo.bio,
            tone: response.data.data.userInfo.tone,
          });
          setCredit(response.data.data.user.credits)
        }
      } catch (error) {
        toast.error('Error fetching user data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    console.log('Updating field:', name, 'with value:', value) // Add logging for debugging
    setUserData(prev => ({ ...prev, [name]: value }))
  }

  const handleToneChange = (value: string) => {
    setUserData((prev) => ({ ...prev, tone: value }))
  }

  const handleSave = async () => {
    setIsEditing(false)
    setIsLoading(true)
    try {
      const response = await axios.post<ApiResponse>('/api/updateUserData', userData)
      if (response.data.success) {
        toast.success('Profile updated successfully')
        setUserData(response.data.data)
      } else {
        toast.error('Failed to update profile')
      }

    } catch (error) {
      toast.error('Error fetching user data')
    }finally{
      setIsLoading(false)
    }
    
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-6 pt-24 pb-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 md:px-6 pt-24 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              {isEditing ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your basic information used for your profile</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      {isEditing ? (
                        <Input id="fullName" name="fullName" placeholder={userData.fullName} value={userData.fullName} onChange={handleChange} />
                      ) : (
                        <p className="text-lg font-medium text-primary">{userData.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="professionTitle">Profession/Title</Label>
                      {isEditing ? (
                        <Input id="professionTitle" name="professionTitle" placeholder={userData.professionTitle} value={userData.professionTitle} onChange={handleChange} />
                      ) : (
                        <p className="text-base text-muted-foreground">{userData.professionTitle}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          name="bio"
                          className="min-h-[120px]"
                          value={userData.bio}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed text-muted-foreground/90 italic">{userData.bio}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Social Profiles</CardTitle>
                    <CardDescription>Your professional social media profiles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedinURL">LinkedIn Profile URL</Label>
                      {isEditing ? (
                        <><p className="text-xs text-muted-foreground mb-1">LinkedIn URL cannot be edited</p>
                        <Input
                          id="linkedinURL"
                          name="linkedinURL"
                          value={userData.linkedinURL}
                          onChange={handleChange} /></>
                      ) : (
                        <a 
                          href={userData.linkedinURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline block truncate"
                        >
                          {userData.linkedinURL}
                        </a>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="githubURL">GitHub Profile URL</Label>
                      {isEditing ? (
                        <Input id="githubURL" name="githubURL" placeholder={userData.githubURL} onChange={handleChange} />
                      ) : (
                        <a 
                          href={userData.githubURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-800 hover:text-black hover:underline block truncate"
                        >
                          {userData.githubURL || "Not provided"}
                        </a>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="portfolioURL">Portfolio Website</Label>
                      {isEditing ? (
                        <Input
                          id="portfolioURL"
                          name="portfolioURL"
                          placeholder={userData.portfolioURL}
                          onChange={handleChange}
                        />
                      ) : (
                        <a 
                          href={userData.portfolioURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:underline block truncate"
                        >
                          {userData.portfolioURL || "Not provided"}
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interests & Industries</CardTitle>
                    <CardDescription>Topics you're interested in for your content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>Your Interests</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {userData.interests.map((interest) => (
                          <Badge key={interest} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Editing interests is not available in this version
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Preferences</CardTitle>
                    <CardDescription>Your preferred tone for LinkedIn posts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <RadioGroup value={userData.tone} onValueChange={handleToneChange} className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="formal" id="formal" />
                          <Label htmlFor="formal" className="cursor-pointer">
                            Formal
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="friendly" id="friendly" />
                          <Label htmlFor="friendly" className="cursor-pointer">
                            Friendly
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="inspirational" id="inspirational" />
                          <Label htmlFor="inspirational" className="cursor-pointer">
                            Inspirational
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="educational" id="educational" />
                          <Label htmlFor="educational" className="cursor-pointer">
                            Educational
                          </Label>
                        </div>
                      </RadioGroup>
                    ) : (
                      <div className="flex items-center">
                        <Badge variant="outline" className="capitalize">
                          {userData.tone}
                        </Badge>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {userData.tone === "formal" && "Professional and structured"}
                          {userData.tone === "friendly" && "Approachable and conversational"}
                          {userData.tone === "inspirational" && "Motivational and uplifting"}
                          {userData.tone === "educational" && "Informative and instructional"}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Your Subscription</CardTitle>
                  <CardDescription>Manage your subscription and usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Current Plan</h3>
                        <Badge>Free</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You are currently on the Free plan with limited features.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Usage</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">LinkedIn Posts</span>
                          <span className="text-sm font-medium">{credit}/5 remaining</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(credit! / 5) * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground">Your posts will reset on the 1st of next month.</p>
                      </div>
                    </div>

                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Check className="h-4 w-4 mr-2 text-primary" />
                        Premium Coming Soon
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        We're working on a Premium plan with unlimited posts, advanced AI features, and more.
                      </p>
                      <Button variant="outline" className="w-full">
                        Join Waitlist
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
