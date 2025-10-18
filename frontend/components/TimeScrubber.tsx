"use client"

import { useState, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HistoricalEvent {
  timestamp: number
  name: string
  description: string
}

const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    timestamp: new Date("2022-05-09").getTime(),
    name: "Terra Collapse",
    description: "UST stablecoin loses peg, LUNA crashes to near zero",
  },
  {
    timestamp: new Date("2022-11-11").getTime(),
    name: "FTX Fall",
    description: "FTX exchange files for bankruptcy, $8B in customer funds missing",
  },
  {
    timestamp: new Date("2022-09-15").getTime(),
    name: "ETH Merge",
    description: "Ethereum transitions from Proof of Work to Proof of Stake",
  },
  {
    timestamp: new Date("2023-03-11").getTime(),
    name: "Silicon Valley Bank",
    description: "SVB collapse triggers USDC depeg concerns",
  },
  {
    timestamp: new Date("2024-03-14").getTime(),
    name: "Bitcoin Halving",
    description: "Bitcoin block reward reduced to 3.125 BTC",
  },
]

export function TimeScrubber() {
  const startTime = new Date("2022-01-01").getTime()
  const endTime = Date.now()
  const totalDuration = endTime - startTime

  const [currentTime, setCurrentTime] = useState(endTime)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState("1")
  const [hoveredEvent, setHoveredEvent] = useState<HistoricalEvent | null>(null)
  const [hoveredEventPosition, setHoveredEventPosition] = useState(0)

  // Calculate progress percentage
  const progress = ((currentTime - startTime) / totalDuration) * 100

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  // Format duration
  const formatDuration = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days}d ${hours}h`
  }

  // Skip forward/backward
  const skip = (hours: number) => {
    const newTime = currentTime + hours * 60 * 60 * 1000
    setCurrentTime(Math.max(startTime, Math.min(endTime, newTime)))
  }

  // Jump to event
  const jumpToEvent = (timestamp: number) => {
    setCurrentTime(timestamp)
    setIsPlaying(false)
  }

  // Playback effect
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const speedMultiplier = Number.parseInt(speed)
        const increment = 1000 * speedMultiplier // 1 second * speed
        const newTime = prev + increment

        if (newTime >= endTime) {
          setIsPlaying(false)
          return endTime
        }

        return newTime
      })
    }, 100) // Update every 100ms for smooth animation

    return () => clearInterval(interval)
  }, [isPlaying, speed, endTime])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        setIsPlaying((prev) => !prev)
      } else if (e.code === "ArrowLeft") {
        e.preventDefault()
        skip(-1)
      } else if (e.code === "ArrowRight") {
        e.preventDefault()
        skip(1)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentTime])

  return (
    <div className="glass-card p-6 border-2 border-transparent bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 bg-clip-padding">
      {/* Current Time Display */}
      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-white mb-2">{formatDate(currentTime)}</div>
        <div className="text-sm text-gray-400">
          {formatDuration(currentTime - startTime)} / {formatDuration(totalDuration)}
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="mb-8 relative">
        {/* Progress bar background */}
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-2">
          {/* Filled progress */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />

          {/* Event markers */}
          {HISTORICAL_EVENTS.map((event) => {
            const eventProgress = ((event.timestamp - startTime) / totalDuration) * 100
            return (
              <button
                key={event.timestamp}
                className="absolute top-0 bottom-0 w-1 bg-yellow-400 hover:bg-yellow-300 transition-colors cursor-pointer group"
                style={{ left: `${eventProgress}%` }}
                onClick={() => jumpToEvent(event.timestamp)}
                onMouseEnter={(e) => {
                  setHoveredEvent(event)
                  setHoveredEventPosition(eventProgress)
                }}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                <div className="absolute inset-0 animate-pulse bg-yellow-400/50 rounded-full" />
              </button>
            )
          })}
        </div>

        {/* Range slider */}
        <input
          type="range"
          min={startTime}
          max={endTime}
          value={currentTime}
          onChange={(e) => setCurrentTime(Number.parseInt(e.target.value))}
          className="w-full h-3 appearance-none bg-transparent cursor-pointer relative z-10 -mt-5"
          style={{
            background: "transparent",
          }}
        />

        {/* Event tooltip */}
        {hoveredEvent && (
          <div
            className="absolute top-full mt-2 glass-card p-3 min-w-[250px] z-20 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              left: `${hoveredEventPosition}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="text-yellow-400 font-semibold mb-1">{hoveredEvent.name}</div>
            <div className="text-xs text-gray-400 mb-1">{formatDate(hoveredEvent.timestamp)}</div>
            <div className="text-sm text-gray-300 mb-2">{hoveredEvent.description}</div>
            <div className="text-xs text-purple-400">Click to jump</div>
          </div>
        )}

        {/* Time range labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatDate(startTime)}</span>
          <span className="text-purple-400">{progress.toFixed(1)}%</span>
          <span>{formatDate(endTime)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Transport Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => skip(-1)}
            className="glass-card border-white/20 hover:border-purple-400/50 hover:bg-purple-500/20"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`glass-card border-white/20 hover:border-purple-400/50 hover:bg-purple-500/20 ${
              isPlaying ? "animate-pulse" : ""
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => skip(1)}
            className="glass-card border-white/20 hover:border-purple-400/50 hover:bg-purple-500/20"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Speed:</span>
          <Select value={speed} onValueChange={setSpeed}>
            <SelectTrigger className="w-[100px] glass-card border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/20">
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="10">10x</SelectItem>
              <SelectItem value="100">100x</SelectItem>
              <SelectItem value="1000">1000x</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 text-xs text-gray-500 text-center">Space: Play/Pause • ← →: Skip 1 hour</div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
          transition: all 0.2s;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.8);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
          transition: all 0.2s;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.8);
        }
      `}</style>
    </div>
  )
}
