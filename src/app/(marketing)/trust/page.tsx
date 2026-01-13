import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Lock,
  FileCheck,
  Eye,
  UserCheck,
  Scale,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

export const metadata = {
  title: "Trust & Compliance",
  description:
    "Learn about our ACA-compliant wellness program design, privacy protections, and data handling practices.",
}

const compliancePoints = [
  {
    icon: FileCheck,
    title: "ACA/HIPAA Compliant",
    description:
      "HealthReturns is structured as a Health-Contingent Wellness Program under ACA regulations, meeting all HIPAA privacy requirements.",
  },
  {
    icon: Scale,
    title: "No Penalties",
    description:
      "We never penalize employees for health status. Everyone starts neutral and earns rewards through engagement.",
  },
  {
    icon: UserCheck,
    title: "Reasonable Alternatives",
    description:
      "Every level includes alternative pathways for those with medical conditions or limitations.",
  },
  {
    icon: Eye,
    title: "Transparent Disclosure",
    description:
      "Clear, plain-language explanations of what's tracked, who sees what, and how rewards are earned.",
  },
]

const privacyPrinciples = [
  {
    title: "Data Minimization",
    description:
      "We only collect data necessary for program operation. No unnecessary tracking or profiling.",
  },
  {
    title: "Purpose Limitation",
    description:
      "Health data is used solely for wellness program evaluation and rebate calculation.",
  },
  {
    title: "Employer Boundaries",
    description:
      "Employers never access individual health metrics. Only aggregate, anonymized data is shared.",
  },
  {
    title: "Employee Control",
    description:
      "You can view, export, or delete your data at any time. Disconnect sources whenever you want.",
  },
  {
    title: "Secure Storage",
    description:
      "All data is encrypted at rest and in transit. We use industry-standard security practices.",
  },
  {
    title: "No Data Sales",
    description:
      "We never sell, rent, or share your personal health data with third parties for marketing.",
  },
]

const dataHandling = [
  {
    category: "What We Collect",
    items: [
      "Activity data (steps, active minutes, distance)",
      "Heart rate metrics (resting HR, HRV)",
      "Sleep data (duration, quality scores)",
      "Body composition (weight, BMI if provided)",
      "Blood pressure (if connected)",
      "Lab results (if connected to Function Health)",
    ],
  },
  {
    category: "How We Use It",
    items: [
      "Establish baseline health snapshot",
      "Evaluate improvement or maintenance",
      "Calculate level progression",
      "Determine rebate eligibility",
      "Generate personalized insights (optional)",
    ],
  },
  {
    category: "Who Sees What",
    items: [
      "You: Full access to all your data and history",
      "HealthReturns: Necessary data for program operation",
      "Your Employer: Aggregate statistics only (participation rates, level distribution)",
      "Third Parties: Never shared for marketing or other purposes",
    ],
  },
]

export default function TrustPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Shield className="mr-1 h-3 w-3" />
              Trust & Compliance
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Built on Trust
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Compliance isn't an add-on. It's our foundation. Privacy isn't a
              feature. It's our promise.
            </p>
          </div>
        </div>
      </section>

      {/* Compliance Framework */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Regulatory Compliance
            </h2>
            <p className="mt-4 text-muted-foreground">
              HealthReturns is designed from the ground up to meet ACA and HIPAA
              requirements for employer wellness programs.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2">
            {compliancePoints.map((point) => (
              <Card key={point.title}>
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <point.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="mt-4">{point.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {point.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Compliance Info */}
          <div className="mx-auto mt-16 max-w-3xl">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold">Program Structure</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  HealthReturns operates as a Health-Contingent Wellness Program
                  under the ACA and HIPAA wellness program regulations (29 CFR
                  2590.702).
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="font-medium">Incentive Limits</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Incentives are capped at 30% of the cost of employee-only
                      coverage (50% when including tobacco cessation programs), as
                      required by ACA regulations.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Reasonable Alternatives</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Every reward level includes reasonable alternative standards
                      for individuals who cannot meet the primary requirements due to
                      medical conditions. Options include physician attestation,
                      health coaching participation, and preventive care completion.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Voluntary Participation</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Participation is entirely voluntary. Non-participation never
                      affects health coverage eligibility, premium rates, or
                      employment status.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Annual Opportunity</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      All employees have an annual opportunity to qualify for rewards
                      at each level, with quarterly evaluation windows throughout the
                      program year.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight">
              Privacy Principles
            </h2>
            <p className="mt-4 text-muted-foreground">
              Your health data is sensitive. We treat it that way.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {privacyPrinciples.map((principle) => (
              <Card key={principle.title}>
                <CardContent className="p-6">
                  <h3 className="font-semibold">{principle.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {principle.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Handling */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Data Handling</h2>
            <p className="mt-4 text-muted-foreground">
              Complete transparency about what we collect, how we use it, and who
              can access it.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
            {dataHandling.map((section) => (
              <Card key={section.category}>
                <CardHeader>
                  <CardTitle>{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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

      {/* What We Don't Do */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border bg-card p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold">What We Never Do</h3>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-destructive">✕</span>
                    Share individual health data with employers
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-destructive">✕</span>
                    Sell or rent your data to third parties
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-destructive">✕</span>
                    Use health data for insurance underwriting
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-destructive">✕</span>
                    Penalize employees for non-participation
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-destructive">✕</span>
                    Require genetic or diagnostic information
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-destructive">✕</span>
                    Track location or non-health behaviors
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Security Practices
            </h2>
            <p className="mt-4 text-muted-foreground">
              Enterprise-grade security to protect your health information.
            </p>

            <div className="mt-12 grid gap-6 text-left sm:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold">Encryption</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    All data is encrypted at rest (AES-256) and in transit (TLS
                    1.3). OAuth tokens are encrypted before storage.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold">Access Controls</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Role-based access ensures only authorized personnel can access
                    specific data types. All access is logged.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold">Infrastructure</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Hosted on SOC 2 compliant cloud infrastructure with regular
                    security audits and penetration testing.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold">Incident Response</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    24/7 monitoring with documented incident response procedures.
                    Affected users notified within 72 hours of any breach.
                  </p>
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
            <h2 className="text-2xl font-bold">Questions about compliance?</h2>
            <p className="mt-2 text-muted-foreground">
              Our team is here to help with any questions about our program design,
              privacy practices, or regulatory compliance.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="mailto:compliance@healthreturns.com">
                  Contact Compliance Team
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
