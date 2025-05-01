"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { useUser } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StepConfig {
  title: string
  description: string
  fieldName: string
  label: string
  placeholder: string
  required?: boolean
  type: 'text' | 'url' | 'textarea' | 'select' | 'multiselect'
  options?: string[]
}

const TOTAL_STEPS = 7

const stepConfigs: StepConfig[] = [
  {
    title: "What's your name?",
    description: "We'll use this to personalize your experience",
    fieldName: "fullName",
    label: "Full Name",
    placeholder: "John Doe",
    required: true,
    type: 'text'
  },
  {
    title: "What's your profession?",
    description: "This helps us tailor content to your professional field",
    fieldName: "professionTitle",
    label: "Professional Title",
    placeholder: "Software Engineer",
    required: true,
    type: 'text'
  },
  {
    title: "Your online presence",
    description: "Connect your professional profiles",
    fieldName: "linkedinURL",
    label: "LinkedIn Profile URL",
    placeholder: "https://linkedin.com/in/username",
    required: true,
    type: 'url'
  },
  {
    title: "Additional profiles",
    description: "Share your work and contributions",
    fieldName: "additionalProfiles",
    label: "",
    placeholder: "https://github.com/username",
    type: 'url'
  },
  {
    title: "Tell us about yourself",
    description: "Share your professional journey and expertise",
    fieldName: "bio",
    label: "Professional Bio",
    placeholder: "I'm a passionate developer with experience in...",
    required: true,
    type: 'textarea'
  },
  {
    title: "Areas of Interest",
    description: "Select areas you're interested in",
    fieldName: "interests",
    label: "Professional Interests",
    placeholder: "Select your interests",
    required: true,
    type: 'multiselect',
    options: ["Web Development", "Mobile Development", "DevOps", "Cloud Computing", "AI/ML", "Data Science", "Cybersecurity", "UI/UX Design"]
  },
  {
    title: "Communication preferences",
    description: "How would you like your content to sound?",
    fieldName: "tone",
    label: "Preferred Tone",
    placeholder: "Select your preferred tone",
    required: true,
    type: 'select',
    options: ["Formal", "Friendly", "Inspirational", "Educational"]
  }
]

export default function Onboarding() {
  const router = useRouter()
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({
    interests: [],
    githubURL: '',
    portfolioURL: '',
    tone: 'Friendly'
  })


  const handleInputChange = (value: string | string[], field?: string) => {
    const currentConfig = stepConfigs[currentStep - 1]
    
    if (currentStep === 4 && field) {
      // Handle GitHub and Portfolio URLs separately using the field parameter
      setFormData(prev => ({ ...prev, [field]: value }))
    } else if (currentConfig.type === 'multiselect') {
      // Handle array values for interests
      setFormData(prev => ({
        ...prev,
        [currentConfig.fieldName]: Array.isArray(value) ? value : [value]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [currentConfig.fieldName]: value
      }))
    }
  }

  const validateStep = () => {
    const currentConfig = stepConfigs[currentStep - 1]
    if (!currentConfig.required) return true

    if (currentStep === 4) {
      // At least one URL should be provided for additional profiles
      const github = formData.githubURL?.toString() || ''
      const portfolio = formData.portfolioURL?.toString() || ''
      return github.trim() !== '' || portfolio.trim() !== ''
    }

    const value = formData[currentConfig.fieldName]
    if (!value) return false

    if (currentConfig.type === 'url') {
      try {
        new URL(value.toString())
        return true
      } catch {
        return false
      }
    }

    return value.toString().trim() !== ''
  }

  const handleNext = async () => {
    if (currentStep === TOTAL_STEPS) {
      try {
        setIsSubmitting(true);
        const response = await axios.post('/api/user_info', formData);

        if (response.data.success) {
          toast.success("Profile created successfully!");
          router.push("/dashboard");
        } else {
          toast.error(response.data.message || "Failed to save profile");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || "An error occurred while saving your profile");
        } else {
          toast.error("An unexpected error occurred");
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    setCurrentStep(prev => prev + 1);
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const currentConfig = stepConfigs[currentStep - 1]
  const progress = (currentStep / TOTAL_STEPS) * 100

  const renderInput = () => {
    if (currentStep === 4) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="githubURL">GitHub Profile URL</Label>
            <Input
              id="githubURL"
              type="url"
              placeholder="https://github.com/username"
              value={formData.githubURL}
              onChange={(e) => handleInputChange(e.target.value, 'githubURL')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolioURL">Portfolio URL</Label>
            <Input
              id="portfolioURL"
              type="url"
              placeholder="https://portfolio.com"
              value={formData.portfolioURL}
              onChange={(e) => handleInputChange(e.target.value, 'portfolioURL')}
            />
          </div>
        </div>
      )
    }

    const value = formData[currentConfig.fieldName] || ''

    switch (currentConfig.type) {
      case 'textarea':
        return (
          <textarea
            id={currentConfig.fieldName}
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2"
            placeholder={currentConfig.placeholder}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
          />
        )
      case 'multiselect':
        return (
          <div className="flex flex-wrap gap-2">
            {currentConfig.options?.map(option => (
              <div
                key={option}
                onClick={() => {
                  const interests = formData.interests || []
                  const newInterests = interests.includes(option)
                    ? interests.filter((i: string) => i !== option)
                    : [...interests, option]
                  handleInputChange(newInterests)
                }}
                className={`cursor-pointer px-3 py-1 rounded-full text-sm ${
                  formData.interests?.includes(option)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        )
      case 'select':
        return (
          <select
            id={currentConfig.fieldName}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
          >
            {currentConfig.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      default:
        return (
          <Input
            id={currentConfig.fieldName}
            type={currentConfig.type}
            placeholder={currentConfig.placeholder}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
          />
        )
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Step {currentStep} of {TOTAL_STEPS}</span>
          <Progress value={progress} className="h-2 w-24" />
        </div>
        <CardTitle className="text-2xl font-bold">{currentConfig.title}</CardTitle>
        <CardDescription>{currentConfig.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={currentConfig.fieldName}>{currentConfig.label}</Label>
            {renderInput()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentStep > 1 && (
          <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
            Back
          </Button>
        )}
        <Button 
          className={`${currentStep === 1 ? 'w-full' : ''} bg-orange-500 hover:bg-orange-600`}
          onClick={handleNext} 
          disabled={!validateStep() || isSubmitting}
        >
          {isSubmitting ? (
            "Saving..."
          ) : (
            currentStep === TOTAL_STEPS ? "Complete" : "Continue"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}