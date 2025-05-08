"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Toaster } from "sonner"
import { redirect, usePathname } from "next/navigation"
import { Sidebar } from "./_components/Sidebar"
import axios from "axios"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const { userId } = auth()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const initialPostId = pathname.split('/').pop()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/getPosts')
        if (response.data.success) {
          setPosts(response.data.data)
        }
        if(response.status === 404){
          redirect("/onboarding")
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // if (!userId) {
  //   redirect("/sign-in")
  // }

  return (
    <div className="flex max-h-screen">
      <Sidebar 
        posts={posts} 
        isLoading={isLoading} 
        initialPostId={pathname === '/dashboard' ? undefined : initialPostId} 
      />
      <div className="flex-1 flex flex-col  overflow-auto">
        <Navbar />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            className: "bg-background text-foreground",
            style: {
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
            },
          }}
        />
        <main className="flex-1 overflow-y-auto pt-24 pb-10">
          {children}
          
        </main>
        
      </div>
    </div>
  )
}
