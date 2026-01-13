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
    icon: DollarSign,
    title: "Real Financial Rewards",
    description:
      "Earn up to 30% in premium rebates by improving or maintaining your health metrics.",
  },
  {
    icon: Scale,
    title: "Fair For Everyone",
    description:
      "Whether you're starting your health journey or already at peak fitness, there's a path to rewards.",
  },
  {
    icon: Lock,
    title: "Your Privacy, Protected",
    description:
      "Your employer never sees your health data. Only you control your information.",
  },
  {
    icon: Target,
    title: "Clear Goals",
    description:
      "Always know exactly what you need to do to reach the next level and earn higher rebates.",
  },
  {
    icon: Heart,
    title: "No Penalties",
    description:
      "This isn't about punishment. Everyone starts neutral and earns rewards through engagement.",
  },
  {
    icon: Smartphone,
    title: "Easy Tracking",
    description:
      "Connect devices you already use — Apple Watch, Garmin, smart scales — or enter data manually.",
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
      "We integrate with Apple Health, Garmin Connect, Renpho smart scales, and Function Health labs. If you don't use any of these, you can enter metrics manually or use our verified partner network.",
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
            <Badge variant="secondary" className="mb-4">
              <Heart className="mr-1 h-3 w-3" />
              For Employees
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Your Health. Your Rewards.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Earn real financial rewards for taking care of your health. Fair
              regardless of where you start. Your employer never sees your data.
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
              Why Join HealthReturns?
            </h2>
            <p className="mt-4 text-muted-foreground">
              A wellness program that actually rewards you — without invading your
              privacy.
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
              Earn More at Every Level
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start anywhere. Grow from there. Everyone has a path to rewards.
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
                Your Privacy is Non-Negotiable
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We built HealthReturns with privacy as the foundation, not an
                afterthought.
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
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to know about joining HealthReturns.
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
              Ready to earn rewards for your health?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join HealthReturns today and start your journey to better health —
              and better savings.
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
