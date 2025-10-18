"use client"

export function ErrorCard({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  onDismiss,
}: {
  title?: string
  message?: string
  onRetry?: () => void
  onDismiss?: () => void
}) {
  return (
    <div className="glass-card border-red-500/30 bg-red-950/20">
      <div className="flex items-start gap-4 p-6">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-400 mb-2">{title}</h3>
          <p className="text-sm text-gray-300 mb-4">{message}</p>
          <div className="flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors"
              >
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-sm font-medium transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
