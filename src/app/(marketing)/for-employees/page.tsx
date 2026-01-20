import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  Lock,
  DollarSign,
  Target,
  Smartphone,
  Scale,
} from "lucide-react"

export const metadata = {
  title: "For Employees",
  description:
    "Earn real health rebates while keeping your health data private. Fair for all starting points.",
}

const benefits = [
  {
    icon: Scale,
    title: "Start where you are",
    description:
      "Whether you're just getting started or already in great shape, there's a path forward that works for you.",
  },
  {
    icon: Heart,
    title: "Improvement counts",
    description:
      "Small, real progress matters here. You don't need to be perfect; you just need to be moving in the right direction.",
  },
  {
    icon: Lock,
    title: "Your data stays yours",
    description:
      "Your employer sees that you're participating, not what your numbers are. That's by design.",
  },
  {
    icon: Target,
    title: "Know where you stand",
    description:
      "No guessing. You'll always see exactly what's needed to reach the next level.",
  },
  {
    icon: DollarSign,
    title: "Real money back",
    description:
      "This isn't points or gift cards. It's a reduction in what you pay for health coverage.",
  },
  {
    icon: Smartphone,
    title: "Use what you have",
    description:
      "Connect a device you already own, or enter data manually. Either works.",
  },
]

const faqs = [
  {
    question: "Is participation mandatory?",
    answer:
      "No. Participation in HealthReturns is completely voluntary. You can enroll, pause, or leave the program at any time without any penalties to your health coverage.",
  },
  {
    question: "Can my employer see my health data?",
    answer:
      "No. Your employer never has access to your individual biometric data. They only see aggregate, anonymized statistics about the overall program (like what percentage of employees are at each level).",
  },
  {
    question: "What if I have a medical condition?",
    answer:
      "HealthReturns includes reasonable alternative standards for everyone. If you have a medical condition that affects certain metrics, you can qualify through alternative paths like working with a coach or completing preventive screenings.",
  },
  {
    question: "How are rebates paid out?",
    answer:
      "Rebates are typically applied as premium reductions, deductible credits, or employer contributions to your health account. Your employer will communicate the specific method used.",
  },
  {
    question: "What devices work with HealthReturns?",
    answer:
      "We integrate with Garmin Connect, Strava, Oura Ring, WHOOP, Fitbit, Apple Health, Renpho smart scales, and Function Health labs. If you don't use any of these, you can enter metrics manually or use our verified partner network.",
  },
  {
    question: "Can I stop sharing my data?",
    answer:
      "Yes. You can disconnect any data source at any time. You can also revoke consent and leave the program entirely. Your historical data can be deleted upon request.",
  },
]

const levels = [
  {
    level: "Level 0",
    title: "Enrolled",
    rebate: "0%",
    badge: "level0" as const,
    description: "Your starting point when you join",
  },
  {
    level: "Level 1",
    title: "Participation",
    rebate: "~5%",
    badge: "level1" as const,
    description: "Complete enrollment and capture baseline",
  },
  {
    level: "Level 2",
    title: "Improvement",
    rebate: "~15%",
    badge: "level2" as const,
    description: "Show improvement OR maintain excellent health",
  },
  {
    level: "Level 3",
    title: "Excellence",
    rebate: "~30%",
    badge: "level3" as const,
    description: "Sustained improvement OR sustained excellence",
  },
]

export default function ForEmployeesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Taking care of yourself should pay off
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              HealthReturns is a way to earn real money back on your health coverage
              by making progress on the health signals that matter to you. Your
              employer sees that you're engaged, not your personal data.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Join Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              How it works for you
            </h2>
            <p className="mt-4 text-muted-foreground">
              No tricks, no fine print. Here's what to expect.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="mt-4">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Level Preview */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              What you can earn
            </h2>
            <p className="mt-4 text-muted-foreground">
              Progress unlocks higher rebates. You move at your own pace.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {levels.map((level) => (
              <Card key={level.level} className="text-center">
                <CardContent className="p-6">
                  <Badge variant={level.badge} className="mb-3">
                    {level.level}
                  </Badge>
                  <h3 className="font-semibold">{level.title}</h3>
                  <div className="mt-2 text-2xl font-bold text-primary">
                    {level.rebate}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {level.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-2xl text-center">
            <Button asChild>
              <Link href="/how-it-works">
                See Full Level Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight">
                What your employer actually sees
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                This is the full list. There's nothing hidden.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold">What Your Employer Sees</h3>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Overall participation rates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Aggregate level distribution
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Program-wide trends
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold">What Your Employer Never Sees</h3>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-600" />
                      Your specific health metrics
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-600" />
                      Your individual level status
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-600" />
                      Your connected devices or data sources
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Common questions
            </h2>
            <p className="mt-4 text-muted-foreground">
              If something's unclear, it's probably answered here.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-3xl">
            <div className="divide-y">
              {faqs.map((faq) => (
                <div key={faq.question} className="py-6">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to get started?
            </h2>
            <p className="mt-4 text-muted-foreground">
              If your employer offers HealthReturns, you can sign up now.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/trust">Privacy & Trust</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
