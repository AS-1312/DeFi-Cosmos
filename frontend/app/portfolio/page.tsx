"use client"

import { PersonalDashboard } from "@/components/PersonalDashboard"

export default function PortfolioPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Portfolio</h1>
        <p className="text-lg text-gray-400">Your personalized DeFi dashboard</p>
      </div>

      {/* Personal Dashboard Component */}
      <PersonalDashboard />
    </div>
  )
}
