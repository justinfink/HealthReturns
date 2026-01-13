import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  CheckCircle2,
  UserPlus,
  Link2,
  LineChart,
  Award,
  RefreshCcw,
} from "lucide-react"

export const metadata = {
  title: "How It Works",
  description:
    "Learn how HealthReturns helps you earn rebates through measurable health improvements.",
}

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Enroll & Consent",
    description:
      "Join your employer's wellness program with clear, transparent consent. Understand exactly what's tracked and what's not shared.",
    details: [
      "Voluntary participation",
      "Clear data transparency",
      "Explicit employer visibility limits",
    ],
  },
  {
    step: 2,
    icon: Link2,
    title: "Connect Your Data",
    description:
      "Link your health sources like Apple Health, Garmin, or Renpho. Or use manual verification if you prefer.",
    details: [
      "Apple Health integration",
      "Garmin Connect sync",
      "Renpho smart scale",
      "Manual verification fallback",
    ],
  },
  {
    step: 3,
    icon: LineChart,
    title: "Establish Baseline",
    description:
      "We capture a one-time baseline snapshot of your health metrics. No penalties for your starting status.",
    details: [
      "30-day baseline period",
      "No judgment on starting point",
      "Fair for all health levels",
    ],
  },
  {
    step: 4,
    icon: Award,
    title: "Earn Your Level",
    description:
      "Progress through levels by improving your metrics or maintaining excellent health. Each level unlocks higher rebates.",
    details: [
      "Level 1: Participation (~5%)",
      "Level 2: Improvement (~15%)",
      "Level 3: Excellence (~30%)",
    ],
  },
  {
    step: 5,
    icon: RefreshCcw,
    title: "Quarterly Evaluation",
    description:
      "Your level is evaluated quarterly. Clear next actions help you understand what's needed to advance.",
    details: [
      "90-day evaluation windows",
      "No surprise downgrades mid-year",
      "Always know your next steps",
    ],
  },
]

const metrics = [
  {
    category: "Activity",
    items: ["Daily Steps", "Active Minutes", "Distance", "Calories Burned"],
  },
  {
    category: "Heart Health",
    items: ["Resting Heart Rate", "Heart Rate Variability", "Blood Pressure"],
  },
  {
    category: "Sleep",
    items: ["Sleep Duration", "Sleep Quality", "Deep Sleep", "REM Sleep"],
  },
  {
    category: "Body Composition",
    items: ["Weight", "BMI", "Body Fat %"],
  },
  {
    category: "Labs (Optional)",
    items: ["Blood Glucose", "HbA1c", "Cholesterol Panel"],
  },
]

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Simple & Transparent
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              How HealthReturns Works
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              A clear, step-by-step path from enrollment to earning rebates.
              No hidden requirements. No surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 h-full w-px bg-border" />

              {/* Steps */}
              <div className="space-y-12">
                {steps.map((step, index) => (
                  <div key={step.step} className="relative flex gap-6">
                    {/* Step number */}
                    <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg">
                      <step.icon className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">Step {step.step}</Badge>
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        {step.description}
                      </p>
                      <ul className="mt-4 space-y-2">
                        {step.details.map((detail) => (
                          <li
                            key={detail}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics We Track */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Metrics We Track
            </h2>
            <p className="mt-4 text-muted-foreground">
              A comprehensive view of your health, with full control over what
              you share.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Level Details */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Level Progression
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every level is achievable through either improvement OR maintenance.
              Fair for all starting points.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid gap-8">
              {/* Level 0 */}
              <Card className="border-muted">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="level0" className="mb-2">
                        Level 0
                      </Badge>
                      <h3 className="text-xl font-semibold">Enrolled</h3>
                      <p className="mt-1 text-muted-foreground">
                        Starting point for all participants
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">0%</div>
                      <div className="text-sm text-muted-foreground">rebate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Level 1 */}
              <Card className="border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="level1" className="mb-2">
                        Level 1
                      </Badge>
                      <h3 className="text-xl font-semibold">Participation</h3>
                      <p className="mt-1 text-muted-foreground">
                        Complete enrollment and establish baseline
                      </p>
                      <ul className="mt-4 space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          Enrollment completed
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          Consent granted
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          Baseline measurement captured
                        </li>
                      </ul>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">~5%</div>
                      <div className="text-sm text-muted-foreground">rebate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Level 2 */}
              <Card className="border-teal-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="level2" className="mb-2">
                        Level 2
                      </Badge>
                      <h3 className="text-xl font-semibold">
                        Improvement OR Maintenance
                      </h3>
                      <p className="mt-1 text-muted-foreground">
                        Show improvement from baseline, or maintain healthy ranges
                      </p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium">Path A: Improvement</p>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <li>• BP decreases meaningfully</li>
                            <li>• HbA1c improves</li>
                            <li>• Activity increases</li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Path B: Maintenance</p>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <li>• BP already optimal</li>
                            <li>• Annual screening complete</li>
                            <li>• Activity verified</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">~15%</div>
                      <div className="text-sm text-muted-foreground">rebate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Level 3 */}
              <Card className="border-green-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="level3" className="mb-2">
                        Level 3
                      </Badge>
                      <h3 className="text-xl font-semibold">
                        Sustained Excellence
                      </h3>
                      <p className="mt-1 text-muted-foreground">
                        Sustained improvement or sustained excellent health
                      </p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium">
                            Path A: Sustained Improvement
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <li>• Consistent gains over time</li>
                            <li>• Multiple quarters of progress</li>
                            <li>• Engagement maintained</li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Path B: Sustained Excellence
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <li>• Already lean, active</li>
                            <li>• Excellent sleep patterns</li>
                            <li>• Prevents regression</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ~25-30%
                      </div>
                      <div className="text-sm text-muted-foreground">rebate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Ready to get started?</h2>
            <p className="mt-2 text-muted-foreground">
              Join HealthReturns and start earning rewards for your health journey.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Get Started
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
    </div>
  )
}
