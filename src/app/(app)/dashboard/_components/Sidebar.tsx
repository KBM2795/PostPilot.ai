"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Menu, Plus, MessageSquare, ChevronFirst, ChevronLast, AppWindow, FileX2 } from "lucide-react"
import axios from "axios"

interface SidebarProps {
  posts: Array<{
    _id: string
    prompt: {
      topic: string
    }
    createdAt: string
  }>
  isLoading: boolean
  initialPostId?: string
}

export function Sidebar({ posts, isLoading, initialPostId  }: SidebarProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const  handleDelete = async (ID: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?")
    if (confirmDelete) {
      try {
        const response = await axios.post(`/api/deletePost?ID=${ID}`)

        if (response.data.success) {
          window.location.reload()
        } else {
          console.error("Error deleting post:", response.data.message)
        }
      } catch (error) {
        console.log("Error deleting post:", error);
      }
    }
  }

  const handleNewPost = () => {
    router.push('/dashboard')
  }

  const handlePostSelect = (postId: string) => {
    router.push(`/dashboard/${postId}`)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  

  return (
    <div className="z-100 absolute">
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-15 w-10  left-4 z-50 lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-10 w-10" />
      </Button>

      <div 
        className={`
          ${isSidebarOpen ? 'w-80' : 'w-0 lg:w-20'} 
          transform transition-all duration-200 ease-in-out
          border-r border-border flex flex-col fixed lg:relative z-40 
          bg-background h-screen shadow-lg pt-16
        `}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute right-5 top-10 hidden lg:flex"
        >
          {isSidebarOpen ? (
            <AppWindow size={48} color="#d68800" strokeWidth={1.75} />
          ) : (
            <AppWindow  size={48} className="h-4 w-4" />
          )}
        </Button>

        <div className={`p-4 flex flex-col items-center justify-between border-b ${!isSidebarOpen && 'items-center'}`}>
          <h2 className={`font-bold text-2xl mb-4 ${!isSidebarOpen && 'hidden'}`}>Your Posts</h2>
          <div className={`w-full border-b-3 border-gray-500 ${!isSidebarOpen && 'hidden'}`}></div>
          <Button 
            onClick={handleNewPost} 
            variant="default" 
            size={isSidebarOpen ? "lg" : "icon"} 
            className="w-full mt-4 bg-blue-500"
          >
            <Plus className={isSidebarOpen ? "h-6 w-full" : "h-4 w-4"} />
            {isSidebarOpen && " New Post"}
          </Button>
        </div>

        <ScrollArea className="flex-1 mt-5">
          <div className="px-2 space-y-2 gap-2">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="w-full h-16 p-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : (
              posts.map((post) => (
                <Button
                  key={post._id}
                  variant="ghost"
                  className={`w-full h-fit justify-start text-left px-2 py-2 hover:bg-orange-100 ${
                    initialPostId === post._id ? 'bg-orange-300' : ''
                  }`}
                  onClick={() => handlePostSelect(post._id)}
                >
                  <div className={`truncate gap-3 w-full items-center ${!isSidebarOpen && 'flex justify-center'}`}>
                    {isSidebarOpen ? (
                      <>
                        <span className="text-lg w-fit ">
                          <MessageSquare className="inline-block mr-2"/> 
                          {post.prompt.topic.length > 20 
                            ? `${post.prompt.topic.slice(0, 20)}...` 
                            : post.prompt.topic}
                          <button 
                            className="float-right right-1 w-6 h-6 top-3 relative"
                            onClick={()=>handleDelete(post._id)}
                          >
                            <FileX2 size={32} color="#ff0000" strokeWidth={2.5} />
                          </button>
                        </span>
                        <div className="text-xs mt-1 text-muted-foreground">
                          {new Date(post.createdAt).toDateString()}
                        </div>
                      </>
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
        
      </div>
    </div>
  )
}