import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  TrendingDown,
  Users,
  BarChart3,
  Lock,
  FileCheck,
} from "lucide-react"

export const metadata = {
  title: "For Employers",
  description:
    "Reduce healthcare costs and increase engagement with ACA-compliant wellness incentives.",
}

const benefits = [
  {
    icon: TrendingDown,
    title: "Healthier employees cost less",
    description:
      "When people improve their health, claims go down. HealthReturns creates a reason to make that happen.",
  },
  {
    icon: Users,
    title: "People actually participate",
    description:
      "Because the program is fair to all starting points, participation rates are high. Nobody feels left out.",
  },
  {
    icon: Shield,
    title: "Compliance is handled",
    description:
      "HealthReturns is structured as an ACA-compliant health-contingent program. No penalties, only rebates.",
  },
  {
    icon: BarChart3,
    title: "See the big picture",
    description:
      "You get aggregate data: participation rates, level distribution, trends. Not individual health records.",
  },
  {
    icon: Lock,
    title: "Privacy by design",
    description:
      "You never see an employee's weight, blood pressure, or any personal metric. That's intentional.",
  },
  {
    icon: FileCheck,
    title: "Low admin burden",
    description:
      "Set up once. We handle enrollment, tracking, level calculations, and rebate reporting.",
  },
]

const complianceFeatures = [
  "Health-contingent wellness program structure (ACA/HIPAA compliant)",
  "Up to 30% of total plan cost in incentives (50% for tobacco cessation)",
  "Reasonable alternative standards for all participants",
  "Voluntary participation with no penalties for non-participation",
  "Annual opportunity to qualify at each level",
  "Transparent disclosure of program rules and requirements",
]

const analyticsFeatures = [
  {
    metric: "Participation Rate",
    description: "Percentage of eligible employees enrolled in the program",
  },
  {
    metric: "Level Distribution",
    description:
      "Breakdown of employees across Level 0, 1, 2, and 3 (no individual data)",
  },
  {
    metric: "Trend Analysis",
    description: "Quarter-over-quarter changes in aggregate participation",
  },
  {
    metric: "Projected Savings",
    description: "Estimated healthcare cost reduction based on level progression",
  },
]

export default function ForEmployersPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              A reason for employees to invest in their health
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Most wellness programs are ignored or gamed. HealthReturns ties rebates to
              real, measurable health signals, so employees have a genuine incentive to
              improve, and you see the results in lower long-term claims.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Request Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/trust">View Compliance</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              What's different about this
            </h2>
            <p className="mt-4 text-muted-foreground">
              HealthReturns is built around one idea: reward real progress.
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

      {/* Compliance Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                <Shield className="mr-1 h-3 w-3" />
                Compliance Built-In
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                ACA-Compliant by Design
              </h2>
              <p className="mt-4 text-muted-foreground">
                HealthReturns is structured as a Health-Contingent Wellness Program
                that meets all ACA and HIPAA requirements. Compliance is built into
                the platform.
              </p>
              <ul className="mt-8 space-y-4">
                {complianceFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border bg-card p-8 shadow-lg">
              <h3 className="text-lg font-semibold">Incentive Limits</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Under ACA regulations, wellness incentives can total:
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <div className="text-3xl font-bold text-primary">30%</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    General health outcomes
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <div className="text-3xl font-bold text-primary">50%</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    With tobacco cessation
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Percentages of total employee-only coverage cost under the plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              What you see (and don't see)
            </h2>
            <p className="mt-4 text-muted-foreground">
              You get program-level insights. Individual health data stays with the individual.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
            {analyticsFeatures.map((feature) => (
              <Card key={feature.metric}>
                <CardContent className="p-6">
                  <h3 className="font-semibold">{feature.metric}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-2xl rounded-lg border bg-amber-50 p-6 dark:bg-amber-950/20">
            <div className="flex gap-4">
              <Lock className="h-6 w-6 shrink-0 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                  Privacy Guarantee
                </h3>
                <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                  Employers never have access to individual employee biometric data.
                  All analytics are aggregated and anonymized. Small group sizes are
                  suppressed to prevent identification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Pricing
            </h2>
            <p className="mt-4 text-muted-foreground">
              Per-employee pricing. No long-term contracts. No hidden fees.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Request Pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              See if it's a fit
            </h2>
            <p className="mt-4 text-muted-foreground">
              We'll walk you through how HealthReturns works for self-insured employers.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Schedule a Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/how-it-works">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
