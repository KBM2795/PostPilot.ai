"use client"

import { useParams } from "next/navigation"
import { useEffect } from "react"
import { Dashboard } from "../_components/Dashboard"

export default function DashboardPost() {
  const params = useParams()

  return <Dashboard initialPostId={params.postId as string} />
}