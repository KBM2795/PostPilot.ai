"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, X } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useSession, useUser } from '@clerk/nextjs'

// Replace with your n8n webhook URL (fixed double slashes)
const WEBHOOK_URL = 'https://n8n-xe5w.onrender.com//webhook//aa2afed7-4a98-405a-b7fe-1a57d2b1723b/chat'

interface Message {
  type: 'bot' | 'user'
  content: string
}

export function FeedbackBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: `Hi! 
👋 I'm FeedbackBot from PostPilot.ai. I'd love to hear about your experience using our platform to generate LinkedIn posts.
`
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { session } = useSession();
  const { user } = useUser();

  const scrollToBottom = () => {
    const scrollArea = document.querySelector('.scroll-area-viewport')
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessageToN8n = async (message: string) => {
    try {
      console.log('Sending message to n8n:', message)
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: message,
          sessionId: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      console.log('Received response from n8n:', data)

      // Handle different response formats from n8n
      if (data && typeof data === 'object') {
        if (data.text) return data.text
        if (data.message) return data.message
        if (data.response) return data.response
        if (Array.isArray(data) && data.length > 0) {
          // If response is an array, take the first item
          const firstItem = data[0]
          if (typeof firstItem === 'string') return firstItem
          if (typeof firstItem === 'object' && firstItem.text) return firstItem.text
          if (typeof firstItem === 'object' && firstItem.message) return firstItem.message
        }
      }
      // If response format doesn't match any expected format, return the stringified data
      return JSON.stringify(data.output)
    } catch (error) {
      console.error('Error sending message:', error)
      return "Sorry, I'm having trouble connecting right now. Please try again later."
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      // Add user message immediately
      setMessages(prev => [...prev, { type: 'user', content: userMessage }])

      // Get bot response from n8n
      const botResponse = await sendMessageToN8n(userMessage)
      
      // Add bot response
      if (botResponse) {
        setMessages(prev => [...prev, { type: 'bot', content: botResponse }])
      }
    } catch (error) {
      console.error('Error in chat:', error)
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: "Sorry, I encountered an error. Please try again." 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Chat with us</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`rounded-lg px-3 py-2 max-w-[80%] ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {(message.content || '').split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i !== message.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-3 py-2 bg-muted">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button
          className="rounded-full h-12 w-12 p-0"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
