import Link from "next/link"
import Image from "next/image"

const footerNavigation = {
  product: [
    { name: "How It Works", href: "/how-it-works" },
    { name: "For Employers", href: "/for-employers" },
    { name: "For Employees", href: "/for-employees" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Trust & Compliance", href: "/trust" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "HIPAA Notice", href: "/hipaa" },
  ],
  integrations: [
    { name: "Apple Health", href: "#" },
    { name: "Garmin", href: "#" },
    { name: "Renpho", href: "#" },
  ],
}

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="HealthReturns"
                width={52}
                height={52}
                className="h-[52px] w-auto"
              />
              <span className="text-xl font-bold text-foreground">
                HealthReturns
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Get rewarded for improving or sustaining your health. ACA-compliant
              wellness incentives for employer-sponsored health plans.
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Product
                </h3>
                <ul className="mt-4 space-y-3">
                  {footerNavigation.product.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">
                  Company
                </h3>
                <ul className="mt-4 space-y-3">
                  {footerNavigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Legal</h3>
                <ul className="mt-4 space-y-3">
                  {footerNavigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">
                  Integrations
                </h3>
                <ul className="mt-4 space-y-3">
                  {footerNavigation.integrations.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t pt-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} HealthReturns. All rights reserved.
            Health is an asset.
          </p>
        </div>
      </div>
    </footer>
  )
}
