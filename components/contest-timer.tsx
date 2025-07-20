"use client"

import { useEffect, useState } from "react"
import { Clock, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ContestTimerProps {
  endTime: string
  onTimeExpired: () => void
}

export function ContestTimer({ endTime, onTimeExpired }: ContestTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const difference = end - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft(0)
        onTimeExpired()
        return 0
      }

      return Math.floor(difference / 1000) // Convert to seconds
    }

    // Initial calculation
    const initialTime = calculateTimeLeft()
    setTimeLeft(initialTime)

    // Set up interval to update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, onTimeExpired])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (isExpired) return "bg-red-100 text-red-800 border-red-200"
    if (timeLeft <= 300) return "bg-red-100 text-red-800 border-red-200" // Last 5 minutes
    if (timeLeft <= 900) return "bg-yellow-100 text-yellow-800 border-yellow-200" // Last 15 minutes
    return "bg-green-100 text-green-800 border-green-200"
  }

  if (isExpired) {
    return (
      <Badge variant="destructive" className="flex items-center space-x-1">
        <AlertTriangle className="w-3 h-3" />
        <span>Time Expired</span>
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={`flex items-center space-x-2 ${getTimerColor()}`}>
      <Clock className="w-3 h-3" />
      <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
    </Badge>
  )
}
