import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Shield,
  TrendingUp,
  Heart,
  Zap,
  BarChart3,
  Lock,
  Users,
} from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Reward Improvement",
    description:
      "Earn rebates by demonstrating measurable health improvements over time.",
  },
  {
    icon: Shield,
    title: "ACA Compliant",
    description:
      "Built from the ground up to meet ACA wellness program requirements.",
  },
  {
    icon: Heart,
    title: "Maintain Excellence",
    description:
      "Already healthy? Earn rewards for sustaining your excellent health metrics.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Your employer never sees individual health data. Only you control your information.",
  },
  {
    icon: Zap,
    title: "Easy Integration",
    description:
      "Connect Apple Health, Garmin, Renpho, and more to automatically track metrics.",
  },
  {
    icon: BarChart3,
    title: "Clear Progress",
    description:
      "See exactly where you stand and what you need to reach the next level.",
  },
]

const levels = [
  {
    level: "Level 1",
    title: "Participation",
    rebate: "~5%",
    description: "Enroll and establish your baseline",
    requirements: ["Complete enrollment", "Connect a health source", "Capture baseline metrics"],
  },
  {
    level: "Level 2",
    title: "Improvement",
    rebate: "~15%",
    description: "Show improvement or maintain healthy ranges",
    requirements: ["Improve from baseline", "OR maintain excellent metrics", "Complete preventive actions"],
  },
  {
    level: "Level 3",
    title: "Excellence",
    rebate: "~30%",
    description: "Sustained improvement or sustained excellence",
    requirements: ["Consistent improvement", "OR sustained healthy ranges", "Ongoing engagement"],
  },
]

const integrations = [
  { name: "Apple Health", logo: "🍎" },
  { name: "Garmin", logo: "⌚" },
  { name: "Renpho", logo: "⚖️" },
  { name: "Function Health", logo: "🧬" },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-6">
              ACA-Compliant Wellness Incentives
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Health is an{" "}
              <span className="text-primary">asset</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Get rewarded for improving — or sustaining — your health.
              HealthReturns helps employers deliver ACA-compliant rebates tied to
              measurable health engagement.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="xl" asChild>
                <Link href="/sign-up">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="/how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Thesis Section */}
      <section className="border-y bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <blockquote className="text-2xl font-medium italic text-foreground">
              "When people invest in their health — by improving or sustaining good
              health — they should see returns."
            </blockquote>
            <p className="mt-4 text-muted-foreground">The HealthReturns Philosophy</p>
          </div>
        </div>
      </section>

      {/* How It Works - Levels */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Earn Rewards at Every Level
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No penalties. Only rewards. Everyone starts neutral and earns through
              engagement.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
            {levels.map((level, index) => (
              <Card
                key={level.level}
                className={`relative overflow-hidden ${
                  index === 2 ? "border-primary shadow-lg" : ""
                }`}
              >
                {index === 2 && (
                  <div className="absolute right-4 top-4">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        index === 0
                          ? "level1"
                          : index === 1
                          ? "level2"
                          : "level3"
                      }
                    >
                      {level.level}
                    </Badge>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{level.title}</h3>
                  <p className="mt-2 text-3xl font-bold text-primary">
                    {level.rebate}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      rebate
                    </span>
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {level.description}
                  </p>
                  <ul className="mt-6 space-y-2">
                    {level.requirements.map((req) => (
                      <li key={req} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for Everyone
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Fair regardless of your starting point. Clear paths to rewards.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Connect Your Health Sources
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Seamlessly integrate with the devices and apps you already use.
            </p>
          </div>

          <div className="mx-auto mt-16 flex max-w-2xl flex-wrap items-center justify-center gap-8">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-card text-3xl shadow-sm">
                  {integration.logo}
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {integration.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Employers / For Employees */}
      <section className="border-t bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* For Employers */}
            <div>
              <Badge variant="outline" className="mb-4">
                <Users className="mr-1 h-3 w-3" />
                For Employers
              </Badge>
              <h3 className="text-2xl font-bold">
                Reduce Costs. Increase Engagement.
              </h3>
              <p className="mt-4 text-muted-foreground">
                HealthReturns helps self-insured employers deliver wellness
                incentives that actually work — without compliance risk.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Measurable risk reduction through biomarker tracking
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  ACA-compliant program design built-in
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Aggregate analytics only — no individual health data access
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  High participation through fair, transparent incentives
                </li>
              </ul>
              <Button className="mt-8" asChild>
                <Link href="/for-employers">Learn More for Employers</Link>
              </Button>
            </div>

            {/* For Employees */}
            <div>
              <Badge variant="outline" className="mb-4">
                <Activity className="mr-1 h-3 w-3" />
                For Employees
              </Badge>
              <h3 className="text-2xl font-bold">
                Your Health. Your Rewards. Your Privacy.
              </h3>
              <p className="mt-4 text-muted-foreground">
                Take control of your wellness journey and earn real financial
                benefits — while keeping your health data private.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Fair regardless of your starting health
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Voluntary participation — no penalties
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Your employer never sees your health metrics
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Clear paths to earn premium rebates
                </li>
              </ul>
              <Button className="mt-8" asChild>
                <Link href="/for-employees">Learn More for Employees</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to invest in your health?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join HealthReturns today and start earning rewards for your wellness
              journey.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="xl" asChild>
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="xl" asChild>
                <Link href="/trust">View Compliance Info</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
