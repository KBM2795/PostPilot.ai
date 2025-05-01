"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Menu, Plus, MessageSquare, ChevronFirst, ChevronLast } from "lucide-react"

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

export function Sidebar({ posts, isLoading, initialPostId }: SidebarProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-15 left-4 z-50 lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div 
        className={`
          ${isSidebarOpen ? 'w-80' : 'w-20 lg:w-0'} 
          transform transition-all duration-200 ease-in-out
          border-r border-border flex flex-col fixed lg:relative z-40 
          bg-background h-screen shadow-lg pt-16
        `}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute right-2 top-15 hidden lg:flex"
        >
          {isSidebarOpen ? (
            <ChevronFirst className="h-4 w-4" />
          ) : (
            <ChevronLast className="h-4 w-4" />
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
                  <div className={`truncate gap-1 w-full items-center ${!isSidebarOpen && 'flex justify-center'}`}>
                    {isSidebarOpen ? (
                      <>
                        <span className="text-lg">
                          <MessageSquare className="inline-block mr-2"/> 
                          {post.prompt.topic.length > 20 
                            ? `${post.prompt.topic.slice(0, 20)}...` 
                            : post.prompt.topic}
                        </span>
                        <div className="text-xs text-muted-foreground">
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
        <div className={`p-4 border-t text-xs text-center text-muted-foreground ${!isSidebarOpen && 'hidden'}`}>
          Posts remaining: 5/5
        </div>
      </div>
    </>
  )
}