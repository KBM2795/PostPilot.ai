import React from 'react'
import { SignIn } from '@clerk/nextjs'
import Link from "next/link"

const LoginPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='flex flex-col gap-4'>
        <Link href="/" className="flex items-center justify-center">
          <span className="text-2xl font-bold gradient-text">PostPilot.ai</span>
        </Link>
        <SignIn routing="path" path="/login" />
      </div>
    </div>
  )
}

export default LoginPage