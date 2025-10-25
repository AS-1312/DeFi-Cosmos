"use client"

import { UserActivityHeatmap } from "@/components/UserActivityHeatmap"

export default function UsersPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Activity Analytics</h1>
        <p className="text-lg text-gray-400">
          Track user adoption, retention, and activity patterns across DeFi protocols
        </p>
      </div>

      {/* User Activity Heatmap Component */}
      <UserActivityHeatmap />
    </div>
  )
}
