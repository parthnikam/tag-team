'use client'

export default function SignupConfirmationPage() {
  return (
    <div className="bg-background flex h-screen flex-col items-center justify-center px-4 pb-8 pt-4 sm:pb-10">
      <div className="max-w-md text-center">
        <p className="text-3xl font-bold text-primary-foreground mb-4">Check Your Email</p>
        <p className="text-gray-300 mb-6">
          We&apos;ve sent a confirmation link to your email address. Please click the link to verify your email and complete your sign-up.
        </p>
        <p className="text-gray-400 text-sm">
          If you don&apos;t see the email, please check your spam folder.
        </p>
        <p className="text-primary-foreground mt-8">
          <a href="/auth/login" className="text-blue-400">
            Back to login
          </a>
        </p>
      </div>
    </div>
  )
}
