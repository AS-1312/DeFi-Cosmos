"use client"

import type React from "react"

import { Loader2, Sparkles, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

// SKELETON LOADER - for cards with shimmer effect
interface SkeletonLoaderProps {
  className?: string
  variant?: "card" | "list" | "chart"
}

export function SkeletonLoader({ className, variant = "card" }: SkeletonLoaderProps) {
  return (
    <div className={cn("glass-card p-6 space-y-4", className)}>
      {/* Title skeleton */}
      <div className="h-6 w-1/3 bg-white/10 rounded-lg shimmer" />

      {/* Stats skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-1/2 bg-white/10 rounded shimmer" />
        <div className="h-4 w-2/3 bg-white/10 rounded shimmer" />
      </div>

      {/* Chart skeleton (if card or chart variant) */}
      {(variant === "card" || variant === "chart") && <div className="h-32 w-full bg-white/10 rounded-lg shimmer" />}

      {/* List items (if list variant) */}
      {variant === "list" && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/10 shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-white/10 rounded shimmer" />
                <div className="h-3 w-1/2 bg-white/10 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// SPINNER LOADER - circular spinner with cosmic gradient
interface SpinnerLoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function SpinnerLoader({ size = "md", text, className }: SpinnerLoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2
        className={cn(
          sizeClasses[size],
          "animate-spin text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-clip-text",
        )}
        style={{
          filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))",
        }}
      />
      {text && <p className="text-sm text-white/60 animate-pulse">{text}</p>}
    </div>
  )
}

// PULSE LOADER - pulsing dot with expanding rings
interface PulseLoaderProps {
  color?: "purple" | "pink" | "blue" | "green" | "orange" | "teal"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PulseLoader({ color = "purple", size = "md", className }: PulseLoaderProps) {
  const colorClasses = {
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    teal: "bg-teal-500",
  }

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }

  return (
    <div className={cn("relative inline-flex", className)}>
      {/* Center dot */}
      <div className={cn("rounded-full", colorClasses[color], sizeClasses[size])} />

      {/* Expanding rings */}
      <span className={cn("absolute inset-0 rounded-full animate-ping opacity-75", colorClasses[color])} />
      <span
        className={cn("absolute inset-0 rounded-full animate-ping opacity-50", colorClasses[color])}
        style={{ animationDelay: "0.5s" }}
      />
    </div>
  )
}

// PROGRESS BAR - horizontal bar with gradient fill and loading stages
interface ProgressBarProps {
  progress: number // 0-100
  stage?: string
  className?: string
}

export function ProgressBar({ progress, stage, className }: ProgressBarProps) {
  return (
    <div className={cn("glass-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
          <span className="text-sm font-medium text-white/90">{stage || "Loading..."}</span>
        </div>
        <span className="text-sm font-mono text-white/60">{progress}%</span>
      </div>

      {/* Progress bar track */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        {/* Progress bar fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

// EMPTY STATE - for no data scenarios
interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title = "No data yet",
  description = "Waiting for blockchain activity...",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("glass-card p-12 flex flex-col items-center justify-center text-center", className)}>
      {/* Icon */}
      <div className="mb-4 text-white/20">{icon || <TrendingUp className="h-16 w-16" />}</div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white/80 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-white/50 mb-6 max-w-sm">{description}</p>

      {/* Optional action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full font-medium transition-all duration-200 hover:scale-105"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
