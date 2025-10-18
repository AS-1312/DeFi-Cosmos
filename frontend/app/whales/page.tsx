"use client"

import { WhaleTracker } from "@/components/WhaleTracker"

export default function WhalesPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Whale Tracker</h1>
        <p className="text-lg text-gray-400">Follow the smart money ($100K+ transactions)</p>
      </div>

      {/* Whale Tracker Component */}
      <WhaleTracker />
    </div>
  )
}
