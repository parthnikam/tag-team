'use client'

export default function AuthCodeErrorPage() {
  return (
    <div className="bg-background flex h-screen flex-col items-center justify-center px-4 pb-8 pt-4 sm:pb-10">
      <div className="max-w-md text-center">
        <p className="text-3xl font-bold text-primary-foreground mb-4">Invalid or Expired Link</p>
        <p className="text-gray-300 mb-6">
          The confirmation link you clicked is invalid or has expired. Please try signing up again.
        </p>
        <div className="space-y-4">
          <a
            href="/auth/signup"
            className="inline-block bg-card text-foreground font-semibold py-2 px-6 rounded-full"
          >
            Sign Up Again
          </a>
          <p>
            <a href="/auth/login" className="text-blue-400">
              Back to login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
