import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-primary p-12 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
            <Image
              src="/logo.png"
              alt="HealthReturns"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
          </div>
          <span className="text-2xl font-bold">HealthReturns</span>
        </Link>

        <div className="space-y-6">
          <blockquote className="text-2xl font-medium">
            "Health is an asset. When people invest in it, they should see
            returns."
          </blockquote>
          <p className="text-primary-foreground/80">
            Join thousands of employees earning rewards for improving their health
            metrics.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <span className="text-2xl">🏃</span>
            </div>
            <div>
              <p className="font-medium">Track Activity</p>
              <p className="text-sm text-primary-foreground/80">
                Steps, active minutes, and more
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <span className="text-2xl">❤️</span>
            </div>
            <div>
              <p className="font-medium">Monitor Health</p>
              <p className="text-sm text-primary-foreground/80">
                Heart rate, sleep, and vitals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="font-medium">Earn Rebates</p>
              <p className="text-sm text-primary-foreground/80">
                Up to 30% on your health premium
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="HealthReturns"
                width={52}
                height={52}
                className="h-[52px] w-auto"
              />
              <span className="text-2xl font-bold">HealthReturns</span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
