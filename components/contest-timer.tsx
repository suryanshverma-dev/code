"use client"

import { useState, useEffect } from "react"
import { Clock, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ContestTimerProps {
  endTime: string
  onTimeExpired: () => void
}

export function ContestTimer({ endTime, onTimeExpired }: ContestTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
    total: number
  }>({ hours: 0, minutes: 0, seconds: 0, total: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const difference = end - now

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, total: 0 })
        onTimeExpired()
        return
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds, total: difference })
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime, onTimeExpired])

  const formatTime = (time: number) => time.toString().padStart(2, "0")

  const isLowTime = timeLeft.total <= 5 * 60 * 1000 // 5 minutes
  const isCriticalTime = timeLeft.total <= 60 * 1000 // 1 minute

  if (timeLeft.total <= 0) {
    return (
      <Badge variant="destructive" className="flex items-center space-x-2 px-3 py-2">
        <AlertTriangle className="w-4 h-4" />
        <span className="font-mono text-sm">TIME'S UP!</span>
      </Badge>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Clock
        className={`w-4 h-4 ${isCriticalTime ? "text-red-600" : isLowTime ? "text-orange-600" : "text-gray-600"}`}
      />
      <Badge
        variant={isCriticalTime ? "destructive" : isLowTime ? "secondary" : "outline"}
        className={`font-mono text-sm px-3 py-2 ${isCriticalTime ? "animate-pulse" : ""}`}
      >
        {timeLeft.hours > 0 && `${formatTime(timeLeft.hours)}:`}
        {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </Badge>
      {isLowTime && (
        <span className={`text-xs ${isCriticalTime ? "text-red-600" : "text-orange-600"}`}>
          {isCriticalTime ? "Hurry up!" : "Time running out!"}
        </span>
      )}
    </div>
  )
}
