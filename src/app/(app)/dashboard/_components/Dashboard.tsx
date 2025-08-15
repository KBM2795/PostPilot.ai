"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChevronLeft, ChevronRight, Edit, Loader2, Share, Image as ImageIcon, Type, MessageSquare } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"

interface Post {
  _id: string
  prompt: {
    topic: string
    additional_info: string
    inspiration_link?: string
  }
  postVersions: {
    version: number
    content: {
      text: string
      image_url?: string
      image_id?: string
    }
  }[]
  createdAt: string
}

interface EditConfig {
  type: 'text' | 'image' | 'both'
  prompt: string
}

interface DashboardProps {
  initialPostId?: string
}

export function Dashboard({ initialPostId }: DashboardProps): React.ReactElement {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [postSuccess, setPostSuccess] = useState(false)
  const [generatedPost, setGeneratedPost] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editConfig, setEditConfig] = useState<EditConfig>({ type: 'text', prompt: '' })
  const [isLoadingVersion, setIsLoadingVersion] = useState(false)
  const [versions, setVersions] = useState<string[]>([])
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0)
  const [posts, setPosts] = useState<Post[]>([])
  const [formData, setFormData] = useState({
    topic: "",
    overview: "",
    referenceUrl: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showVersionSelect, setShowVersionSelect] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)

  useEffect(() => {
    setIsLoadingVersion(true)
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get('/api/getPosts')
        if (response.data.success) {
          setPosts(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
        toast.error('Failed to fetch posts')
      } finally {
        setIsLoading(false)
        setIsLoadingVersion(false)
      }
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    if (initialPostId) {
      const post = posts.find(p => p._id === initialPostId)
      if (post) {
        const latestVersion = post.postVersions[post.postVersions.length - 1]
        setGeneratedPost(latestVersion.content.text)
        setFormData(prev => ({ 
          ...prev, 
          topic: post.prompt.topic,
          overview: post.prompt.additional_info,
          referenceUrl: post.prompt.inspiration_link || ""
        }))
        
        // Set versions from all postVersions
        const allVersions = post.postVersions.map(v => v.content.text)
        setVersions(allVersions)
        setCurrentVersionIndex(allVersions.length - 1)
      }
    }
  }, [initialPostId, posts])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setGeneratedPost("")
    setVersions([])
    setCurrentVersionIndex(0)
    setPostSuccess(false)

    try {
      const response = await axios.post('/api/createPost', formData)
      if (response.data.success) {
        const postId = response.data.data
        toast.success('Post created successfully! Redirecting...')
        router.push(`/dashboard/${postId}`)
      } else {
        toast.error(response.data.message || 'Failed to create post')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error creating post')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setFormData({
      topic: "",
      overview: "",
      referenceUrl: "",
    })
    setGeneratedPost("")
    setVersions([])
    setCurrentVersionIndex(0)
    setIsEditing(false)
    setEditConfig({ type: 'text', prompt: '' })
    setPostSuccess(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleVersionChange = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" 
      ? Math.max(0, currentVersionIndex - 1)
      : Math.min(versions.length - 1, currentVersionIndex + 1)

    if (newIndex !== currentVersionIndex) {
      setIsLoadingVersion(true)
      setCurrentVersionIndex(newIndex)
      
      setTimeout(() => {
        setGeneratedPost(versions[newIndex])
        setIsLoadingVersion(false)
      }, 1000)
    }
  }

  const handleEditSubmit = async () => {
    if (!editConfig.prompt.trim()) return
    setIsGenerating(true)
    setIsEditing(false)
    setIsLoadingVersion(true)
     
    try {
      const response = await axios.post('/api/editPost', {
        postId: initialPostId,
        postText: generatedPost,
        editConfig: {
          type: editConfig.type,
          prompt: editConfig.prompt,
        },
      })
      if (response.data.success) {
        const postId = response.data.data
        toast.success('Post edited successfully!')
        window.location.reload()
        router.push(`/dashboard/${postId}`)
      } else {
        toast.error('Failed to edit post:', response.data.message)
      }
    } catch (error: any) {
      console.log( error?.response?.data?.message);
    }finally{
      setIsLoadingVersion(false)
    }
  }

  const handleShare = async () => {
    if (versions.length > 1 && !showVersionSelect) {
      setShowVersionSelect(true)
      return
    }

    setIsPosting(true)
    setPostSuccess(false)

    // Use selectedVersion if it's set, otherwise use currentVersionIndex
    const versionToPost = selectedVersion !== null ? selectedVersion : currentVersionIndex
    console.log(versionToPost);
    
    
    try {
      const post = posts.find(p => p._id === initialPostId)
      const version = post?.postVersions[versionToPost]
      const response = await axios.post("/api/linkedin/accesCheck", {
        postId: initialPostId,
        version: version?.version,
        content: version?.content,
      })

      if (response.data.success) {
        toast.success('Post shared successfully!')
        setPostSuccess(true)
        router.push(response.data.data.linkedin_url)
      } else {
        toast.error(response.data.message)
      }

    } catch (error:any) {
      toast.error(error.response?.data?.message || 'Error sharing post')
    }finally{
      setIsPosting(false)
    }
    
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <div className="container mx-auto p-6">
        {!initialPostId ? (
          <div className="max-w-2xl mx-auto items-center justify-center flex flex-col space-y-5">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Create Social Media Post</CardTitle>
                <CardDescription>Provide details about the post you want to create</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      name="topic"
                      placeholder="e.g., Leadership, AI in Healthcare, Remote Work"
                      value={formData.topic}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overview">Post Overview</Label>
                    <Textarea
                      id="overview"
                      name="overview"
                      placeholder="Briefly describe what you want to share in this post..."
                      className="min-h-[120px]"
                      value={formData.overview}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referenceUrl">Reference URL (Optional)</Label>
                    <Input
                      id="referenceUrl"
                      name="referenceUrl"
                      placeholder="https://linkedin.com/posts/..."
                      value={formData.referenceUrl}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add a URL to a post with a similar style you'd like to emulate
                    </p>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={
                  isGenerating || 
                  !formData.topic || 
                  !formData.overview || 
                  posts.some(post => {
                    const postDate = new Date(post.createdAt).toDateString();
                    const today = new Date().toDateString();
                    return postDate === today;
                  })
                  }
                >
                  {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                  ) : posts.some(post => {
                    const postDate = new Date(post.createdAt).toDateString();
                    const today = new Date().toDateString();
                    return postDate === today;
                  }) ? (
                  <>
                    Daily Limit Reached
                  </>
                  ) : (
                  <>
                    Generate Post
                  </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Post Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {posts.find(p => p._id === initialPostId)?.prompt && (
                    <>
                      <div className="space-y-2">
                        <Label>Topic</Label>
                        <div className="text-sm rounded-md bg-muted p-3">
                          {posts.find(p => p._id === initialPostId)?.prompt.topic}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Overview</Label>
                        <div className="text-sm rounded-md bg-muted p-3">
                          {posts.find(p => p._id === initialPostId)?.prompt.additional_info}
                        </div>
                      </div>
                      {posts.find(p => p._id === initialPostId)?.prompt.inspiration_link && (
                        <div className="space-y-2">
                          <Label>Reference URL</Label>
                          <div className="text-sm rounded-md bg-muted p-3">
                            <a 
                              href={posts.find(p => p._id === initialPostId)?.prompt.inspiration_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline break-all"
                            >
                              {posts.find(p => p._id === initialPostId)?.prompt.inspiration_link}
                            </a>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <div className="flex justify-between w-full">
                    <Button variant="outline" onClick={handleEdit} disabled={isEditing}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button onClick={handleShare} disabled={isPosting}>
                      <Share className="h-4 w-4 mr-2" />
                      {isPosting ? "Posting..." : "Share Post"}
                    </Button>
                  </div>
                  
                  {showVersionSelect && versions.length > 1 && (
                    <div className="w-full px-4 py-5 bg-white flex flex-col gap-3 rounded-md shadow-[0px_0px_15px_rgba(0,0,0,0.09)]">
                      <legend className="text-xl font-semibold mb-3 select-none">Select Version to Share</legend>
                      {versions.map((version, index) => (
                        <label 
                          key={index}
                          htmlFor={`version-${index}`}
                          className="font-medium h-14 relative hover:bg-zinc-100 flex items-center px-3 gap-3 rounded-lg has-[:checked]:text-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:ring-blue-300 has-[:checked]:ring-1 select-none"
                        >
                          <div className="w-5 fill-blue-500">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          Version {index + 1}
                          <input
                            type="radio"
                            name="versionSelect"
                            id={`version-${index}`}
                            value={index.toString()}
                            checked={selectedVersion === index}
                            onChange={(e) => setSelectedVersion(index)}
                            className="w-4 h-4 absolute accent-blue-500 right-3"
                          />
                        </label>
                      ))}
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowVersionSelect(false)
                            setSelectedVersion(null)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleShare}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Confirm & Share
                        </Button>
                      </div>
                    </div>
                  )}
                </CardFooter>
              </Card>

              {isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Post</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 space-y-4">
                      <div className="space-y-4">
                        <Label>What would you like to edit?</Label>
                        <RadioGroup 
                          value={editConfig.type} 
                          onValueChange={(value) => setEditConfig(prev => ({ 
                            ...prev, 
                            type: value as 'text' | 'image' | 'both' 
                          }))}
                          className="grid grid-cols-3 gap-4"
                        >
                          <div>
                            <RadioGroupItem value="text" id="text" className="peer sr-only" />
                            <Label
                              htmlFor="text"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <Type className="mb-2 h-6 w-6" />
                              <span className="text-sm font-medium">Text Only</span>
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem value="image" id="image" className="peer sr-only" />
                            <Label
                              htmlFor="image"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <ImageIcon className="mb-2 h-6 w-6" />
                              <span className="text-sm font-medium">Image Only</span>
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem value="both" id="both" className="peer sr-only" />
                            <Label
                              htmlFor="both"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <div className="mb-2 flex">
                                <Type className="h-6 w-6" />
                                <ImageIcon className="h-6 w-6 ml-1" />
                              </div>
                              <span className="text-sm font-medium">Both</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editPrompt">Edit Prompt</Label>
                        <Textarea
                          id="editPrompt"
                          placeholder={
                            editConfig.type === 'text' 
                              ? "Describe how you want to change the text..." 
                              : editConfig.type === 'image'
                              ? "Describe how you want to change the image..."
                              : "Describe how you want to change both the text and image..."
                          }
                          className="min-h-[100px]"
                          value={editConfig.prompt}
                          onChange={(e) => setEditConfig(prev => ({ ...prev, prompt: e.target.value }))}
                        />
                      </div>
                        {versions.length == 3 ? (
                        <div className="text-red-500 text-sm mt-2">
                          Edit limit reached. Please create a new post to make more changes.
                        </div>
                        ) : ""}
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleEditSubmit} disabled={!editConfig.prompt.trim() || versions.length == 3}>
                          Generate New Version
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card className="bg-card">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Mobile Preview</CardTitle>
                      <CardDescription>How your post will look on LinkedIn</CardDescription>
                    </div>
                    {versions.length > 1 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={currentVersionIndex === 0}
                          onClick={() => handleVersionChange("prev")}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span>
                          Version {currentVersionIndex + 1}/{versions.length}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={currentVersionIndex === versions.length - 1}
                          onClick={() => handleVersionChange("next")}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-w-sm mx-auto border rounded-lg overflow-hidden shadow-md bg-white">
                    <div className="bg-gray-800 text-white p-2 flex justify-between items-center text-xs">
                      <div>9:41</div>
                      <div className="flex space-x-1">
                        <div>📶</div>
                        <div>🔋</div>
                      </div>
                    </div>

                    <div className="bg-white border-b p-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          in
                        </div>
                        <div className="ml-2 text-sm font-semibold">LinkedIn</div>
                      </div>
                      <div className="text-gray-500 text-sm">...</div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                        <div>
                          <div className="font-semibold"></div>
                          <div className="text-xs text-gray-500">Software Engineer at XYZ • 1h</div>
                        </div>
                      </div>

                      {isLoadingVersion ? (
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-40 w-full mt-4" />
                        </div>
                      ) : (
                        <>
                          <div className="text-sm mb-4 whitespace-pre-line">{generatedPost}</div>
                          {posts.find(p => p._id === initialPostId)?.postVersions[currentVersionIndex]?.content.image_url && (
                            <div className="rounded-lg overflow-hidden mb-4">
                              <img
                                src={posts.find(p => p._id === initialPostId)?.postVersions[currentVersionIndex].content.image_url}
                                alt="AI generated image for post"
                                className="w-full h-auto object-cover"
                              />
                            </div>
                          )}
                        </>
                      )}

                      <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                        <span>Like</span>
                        <span>Comment</span>
                        <span>Share</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
