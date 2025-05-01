"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight, CheckCircle, Linkedin, MessageSquare, Sparkles, Zap } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import postimg from "../../public/Top-12-AI-Tools-for-LinkedIn-[2024].jpg"

export default function Home() {
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const howItWorksRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger)

    // Hero animation
    const heroTl = gsap.timeline()
    heroTl.from(".hero-heading", { opacity: 0, y: 50, duration: 0.8 })
    heroTl.from(".hero-description", { opacity: 0, y: 30, duration: 0.6 }, "-=0.4")
    heroTl.from(".hero-buttons", { opacity: 0, y: 30, duration: 0.6 }, "-=0.4")
    heroTl.from(".hero-card", { opacity: 0, y: 30, scale: 0.95, duration: 0.8 }, "-=0.4")

    // Features animation
    gsap.from(".feature-heading", {
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 80%",
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
    })

    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 70%",
      },
      opacity: 0,
      y: 30,
      stagger: 0.2,
      duration: 0.6,
    })

    // How it works animation
    gsap.from(".works-heading", {
      scrollTrigger: {
        trigger: howItWorksRef.current,
        start: "top 80%",
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
    })

    gsap.from(".works-step", {
      scrollTrigger: {
        trigger: howItWorksRef.current,
        start: "top 70%",
      },
      opacity: 0,
      y: 30,
      stagger: 0.2,
      duration: 0.6,
    })

    // CTA animation
    gsap.from(".cta-section", {
      scrollTrigger: {
        trigger: ctaRef.current,
        start: "top 80%",
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
    })

    return () => {
      // Clean up ScrollTrigger when component unmounts
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section ref={heroRef} className="pt-32 pb-20 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6">
                <h1 className="hero-heading text-4xl md:text-5xl font-bold leading-tight">
                  Create Engaging <span className="gradient-text">Social Media Posts</span> with AI
                </h1>
                <p className="hero-description mt-6 text-lg text-muted-foreground">
                  PostPilot.ai helps you craft professional, engaging posts for LinkedIn and other platforms that drive
                  engagement and showcase your expertise.
                </p>
                <div className="hero-buttons mt-8 flex flex-col sm:flex-row gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto hover:bg-orange-300">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hero-card lg:col-span-6 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-card p-8 rounded-2xl border">
                  <div className="flex items-center mb-6">
                    <Linkedin className="h-8 w-8 text-primary mr-3" />
                    <h3 className="text-xl font-semibold">LinkedIn Post Preview</h3>
                  </div>
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="text-foreground mb-4">
                      Excited to share that our team has just launched a new feature that will revolutionize how you
                      interact with your data! 🚀 After months of hard work and collaboration, we've created something
                      that addresses the biggest pain points we've heard from our users. #Innovation #ProductDevelopment
                      #TechNews
                    </p>
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src="https://media.geeksforgeeks.org/wp-content/uploads/20240206110104/Top-12-AI-Tools-for-LinkedIn-[2024].webp"
                        alt="Post image"
                        className="w-full h-auto object-fill"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>24 comments</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Zap className="h-4 w-4 mr-1" />
                      <span>Generated by PostPilot.ai</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" ref={featuresRef} className="py-20 px-6 md:px-10 bg-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="feature-heading text-3xl md:text-4xl font-bold">
                Why Choose <span className="gradient-text">PostPilot.ai</span>
              </h2>
              <p className="feature-description mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform helps you create professional social media content that stands out.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Sparkles className="h-10 w-10 text-primary " />,
                  title: "AI-Powered Content",
                  description: "Our advanced AI understands your professional voice and creates tailored content.",
                },
                {
                  icon: <Zap className="h-10 w-10 text-primary" />,
                  title: "Quick & Effortless",
                  description: "Generate engaging posts in seconds, saving you hours of content creation time.",
                },
                {
                  icon: <Linkedin className="h-10 w-10 text-primary" />,
                  title: "LinkedIn Optimized",
                  description: "Content specifically designed to perform well on LinkedIn's algorithm.",
                },
                {
                  icon: <MessageSquare className="h-10 w-10 text-primary" />,
                  title: "Multiple Platforms",
                  description: "Generate content for LinkedIn, Twitter, Facebook, and other social platforms.",
                },
                {
                  icon: <CheckCircle className="h-10 w-10 text-primary" />,
                  title: "5 Free Posts Monthly",
                  description: "Start with 5 free posts every month. No credit card required.",
                },
                {
                  icon: <CheckCircle className="h-10 w-10 text-primary" />,
                  title: "AI-Generated Images",
                  description: "Our AI generates relevant images to accompany your posts for better engagement.",
                },
              ].map((feature, index) => (
                <div key={index} className={`feature-card bg-card p-8 rounded-2xl shadow-md border`}>
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section ref={howItWorksRef} className="py-20 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="works-heading text-3xl md:text-4xl font-bold">
                How <span className="gradient-text">PostPilot.ai</span> Works
              </h2>
              <p className="works-description mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Create professional social media posts in just a few simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Sign Up & Set Profile",
                  description: "Create an account and tell us about your professional background.",
                },
                {
                  step: "02",
                  title: "Describe Your Post",
                  description: "Provide a topic or outline of what you want to share on social media.",
                },
                {
                  step: "03",
                  title: "Generate & Publish",
                  description: "Our AI creates your post with text and image, which you can edit and publish directly.",
                },
              ].map((step, index) => (
                <div key={index} className={`works-step relative`}>
                  <div className="bg-orange-300 rounded-full h-16 w-16 flex items-center justify-center mb-6">
                    <span className="text-xl font-bold text-accent-foreground ">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>

                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-orange-200 -z-10 transform -translate-x-8">
                      <div className="absolute right-0 top-1/2 transform translate-y-1/2 -translate-x-1/2 rotate-45 w-3 h-3 bg-orange-200"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="py-20 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="cta-section gradient-bg rounded-2xl p-10 md:p-16 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Social Media Presence?</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who are using PostPilot.ai to create engaging content that drives
                results.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
