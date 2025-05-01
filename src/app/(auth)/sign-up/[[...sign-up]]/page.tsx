import React from 'react'
import { SignUp } from '@clerk/nextjs'
import Link from "next/link"

const SignUpPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='flex flex-col gap-4'>
        <Link href="/" className="flex items-center justify-center">
          <span className="text-2xl font-bold gradient-text">PostPilot.ai</span>
        </Link>
        <SignUp routing="path" path="/sign-up" />
      </div>
    </div>
  )
}

export default SignUpPage