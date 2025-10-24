"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, TrendingUp, Users, Zap, Github, Twitter, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [typedText, setTypedText] = useState("")
  const fullText = "Watch Money Flow Through DeFi"

  useEffect(() => {
    // Check if user has seen the welcome screen
    const hasSeenWelcome = localStorage.getItem("defi-cosmos-welcome-seen")
    if (!hasSeenWelcome) {
      setIsVisible(true)
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    // Typing animation
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, 80)

    return () => clearInterval(typingInterval)
  }, [isVisible])

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("defi-cosmos-welcome-seen", "true")
    }
    setIsVisible(false)
  }

  const handleExplore = () => {
    localStorage.setItem("defi-cosmos-welcome-seen", "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Welcome Card */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-2 border-white/20 rounded-3xl p-8 md:p-12 animate-in zoom-in-95 duration-500">
        {/* Skip Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Skip welcome screen"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>

        {/* Hero Section */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              DeFi Cosmos
            </h1>
            <div className="mt-2 h-1 w-32 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
          </div>

          {/* Animated Tagline */}
          <p className="text-2xl md:text-3xl text-white/90 font-light h-10 flex items-center justify-center">
            {typedText}
            <span className="inline-block w-0.5 h-7 bg-purple-400 ml-1 animate-pulse" />
          </p>

          {/* Floating Stars Animation */}
          <div className="relative h-20 mt-6">
            <Sparkles
              className="absolute left-1/4 top-0 w-6 h-6 text-yellow-400 animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <Sparkles
              className="absolute right-1/4 top-2 w-4 h-4 text-blue-400 animate-bounce"
              style={{ animationDelay: "0.3s" }}
            />
            <Sparkles
              className="absolute left-1/3 bottom-0 w-5 h-5 text-purple-400 animate-bounce"
              style={{ animationDelay: "0.6s" }}
            />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Capital Flows */}
          <div className="glass-card-light p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all hover:scale-105">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">See Capital Flows</h3>
            <p className="text-white/70 text-sm">Watch real-time money movement between protocols</p>
          </div>

          {/* Whale Tracking */}
          <div className="glass-card-light p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Track Smart Money</h3>
            <p className="text-white/70 text-sm">Follow whales and learn from their patterns</p>
          </div>

          {/* Personalized */}
          <div className="glass-card-light p-6 rounded-2xl border border-white/10 hover:border-green-500/50 transition-all hover:scale-105">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Your Portfolio, Highlighted</h3>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <Button
            onClick={handleExplore}
            className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all hover:scale-105"
          >
            Explore Dashboard
          </Button>
        </div>

        {/* Stats Ticker */}
        <div className="mb-8 overflow-hidden">
          <div className="glass-card-light rounded-full px-6 py-3 border border-white/10">
            <div className="flex items-center justify-center gap-4 text-sm text-white/70 whitespace-nowrap animate-pulse">
              <span>50K+ transactions tracked</span>
              <span className="text-purple-400">•</span>
              <span>5 protocols</span>
              <span className="text-purple-400">•</span>
              <span>1.2K whales</span>
              <span className="text-purple-400">•</span>
              <span>$68B TVL</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Don't Show Again */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="dont-show"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                className="border-white/30"
              />
              <label htmlFor="dont-show" className="text-sm text-white/60 cursor-pointer">
                Don't show again
              </label>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Docs
              </a>
              <a href="#" className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1">
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a href="#" className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1">
                <Twitter className="w-4 h-4" />
                Twitter
              </a>
            </div>
          </div>

          {/* Built With Badge */}
          <div className="mt-4 text-center">
            <span className="text-xs text-white/40">Built with Envio</span>
          </div>
        </div>
      </div>
    </div>
  )
}
