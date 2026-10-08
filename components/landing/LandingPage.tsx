import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  CreditCard,
  Image as ImageIcon,
  Package,
  Truck,
  Users,
} from "lucide-react";
import MobileMenu from "@/components/landing/MobileMenu";
import PartrixLogo from "@/components/brand/PartrixLogo";

const capabilities = [
  {
    icon: Package,
    title: "Inventory",
    description: "Track quantities, availability, reservations, and item status.",
  },
  {
    icon: CalendarDays,
    title: "Bookings",
    description: "Manage reservations from creation through payment and return.",
  },
  {
    icon: Users,
    title: "Customers",
    description: "Keep customer details and booking history together.",
  },
  {
    icon: CreditCard,
    title: "Payments",
    description: "Record payments, deposits, balances, and expenses.",
  },
  {
    icon: Truck,
    title: "Logistics",
    description: "Plan deliveries and keep pickup and return details close at hand.",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description: "Review bookings, revenue, and expenses in one place.",
  },
];

const problems = [
  "Double bookings and uncertain availability",
  "Customer details scattered across messages",
  "Payments and deposits tracked by hand",
  "Pickup and delivery plans hard to follow",
  "Returns and item condition easy to overlook",
  "Revenue and expenses difficult to review",
];

const showcaseSections = [
  {
    id: "inventory",
    eyebrow: "Inventory",
    title: "Know what's available before you promise it.",
    description:
      "Keep quantities, reservations, and item status in view so your team can make informed decisions when the next booking comes in.",
    benefits: [
      "See stock and availability together",
      "Keep reservations connected to inventory",
      "Track item status, including maintenance",
    ],
    screenshot: "inventory.png",
    reverse: false,
  },
  {
    id: "bookings",
    eyebrow: "Bookings",
    title: "Manage every booking from enquiry to return.",
    description:
      "Keep booking details, customer information, rental items, and status in one workflow instead of piecing the details together later.",
    benefits: [
      "Keep booking and customer records together",
      "Review booking items and rental dates",
      "Follow progress through return",
    ],
    screenshot: "bookings.png",
    reverse: true,
  },
  {
    id: "payments",
    eyebrow: "Payments & finance",
    title: "Keep payments and deposits under control.",
    description:
      "Record what has been paid, what remains due, and the expenses that shape your day-to-day rental operation.",
    benefits: [
      "Review payments against bookings",
      "Keep deposits and balances visible",
      "Record expenses alongside business activity",
    ],
    screenshot: "finance.png",
    reverse: false,
  },
  {
    id: "logistics",
    eyebrow: "Operations",
    title: "Keep the whole operation moving.",
    description:
      "Coordinate delivery schedules, follow delivery status, and keep operational notes connected to the work.",
    benefits: [
      "Review scheduled deliveries",
      "Follow delivery progress",
      "Keep damage and return records organized",
    ],
    screenshot: "operations.png",
    reverse: true,
  },
];

const steps = [
  {
    number: "01",
    title: "Set up your inventory",
    description: "Add the rental items and quantities your business owns.",
  },
  {
    number: "02",
    title: "Create bookings",
    description: "Schedule rentals and check inventory availability.",
  },
  {
    number: "03",
    title: "Run the operation",
    description: "Manage customers, payments, deliveries, and returns.",
  },
  {
    number: "04",
    title: "Understand the business",
    description: "Review bookings, revenue, expenses, and operational data.",
  },
];

const audience = [
  "Event rental businesses",
  "Party rental businesses",
  "Equipment rental businesses",
  "Furniture rental businesses",
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Partrix",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Partrix helps rental businesses manage inventory, bookings, customers, payments, deliveries, and daily operations from one platform.",
};

function ScreenshotPlaceholder({
  name,
  label,
  className = "",
}: {
  name: string;
  label: string;
  className?: string;
}) {
  const assetPath = `/screenshots/${name}`;

  return (
    <figure
      role="img"
      aria-label={`${label} screenshot placeholder. Add the screenshot at public${assetPath}.`}
      data-screenshot-placeholder={name}
      className={`flex min-h-72 items-center justify-center border border-dashed border-slate-300 bg-slate-100 px-6 py-12 text-center sm:min-h-96 ${className}`}
    >
      <figcaption className="max-w-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
          <ImageIcon className="h-5 w-5" aria-hidden />
        </span>
        <span className="mt-5 block text-base font-semibold text-slate-800">
          {label} screenshot
        </span>
        <span className="mt-2 block text-sm leading-6 text-slate-500">
          Screenshot placeholder — replace with your real Partrix screenshot.
        </span>
        <code className="mt-3 block text-xs text-slate-400">public{assetPath}</code>
      </figcaption>
    </figure>
  );
}

export default function LandingPage() {
  return (
    <main className="-mx-4 min-h-screen overflow-hidden bg-[#F7F8FA] text-[#111827] md:-mx-6 lg:-mx-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
          <Link href="/" aria-label="Partrix home" className="shrink-0">
            <PartrixLogo
              size={40}
              textClassName="text-slate-900"
              className="[&_span:first-child]:shadow-none"
            />
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">
            <Link className="text-sm font-medium text-slate-600 transition hover:text-slate-950" href="#product">
              Product
            </Link>
            <Link className="text-sm font-medium text-slate-600 transition hover:text-slate-950" href="#audience">
              Solutions
            </Link>
            <Link className="text-sm font-medium text-slate-600 transition hover:text-slate-950" href="#pricing">
              Pricing
            </Link>
            <Link className="text-sm font-medium text-slate-600 transition hover:text-slate-950" href="#how-it-works">
              Resources
            </Link>
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0B1020] px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Get started
            </Link>
          </div>
          <MobileMenu />
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-10 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">
            The operating system for rental businesses
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#0B1020] sm:text-5xl lg:text-[3.85rem]">
            Run your rental business from one place.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Manage inventory, bookings, customers, payments, and daily operations from one platform
            — without relying on spreadsheets, scattered messages, and disconnected tools.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0B1020] px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create your workspace
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="#product"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Explore the product
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-cyan-800" aria-hidden />
              Built for rental businesses
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-cyan-800" aria-hidden />
              Inventory to returns
            </li>
          </ul>
        </div>
        <ScreenshotPlaceholder
          name="overview.png"
          label="Partrix product overview"
          className="min-h-80 rounded-xl border-slate-300 bg-white sm:min-h-[440px]"
        />
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">The day-to-day</p>
            <h2 className="mt-4 max-w-lg text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#0B1020] sm:text-4xl">
              Rental businesses shouldn&apos;t have to run on spreadsheets and WhatsApp.
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-slate-600">
              When the details live in different places, it takes extra effort to know what is
              available, what is due, and what needs attention next.
            </p>
          </div>
          <ul className="grid content-center gap-x-8 sm:grid-cols-2">
            {problems.map((problem) => (
              <li key={problem} className="flex gap-3 border-b border-slate-200 py-4 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-700" aria-hidden />
                {problem}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="product" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">One connected workspace</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#0B1020] sm:text-4xl">
            Everything your rental business needs to stay organized.
          </h2>
        </div>
        <div className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <article key={title} className="border-t border-slate-300 py-6">
              <Icon className="h-5 w-5 text-cyan-800" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold text-[#0B1020]">{title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Product features" className="bg-white">
        {showcaseSections.map((feature) => (
          <article
            id={feature.id}
            key={feature.id}
            className="scroll-mt-24 border-t border-slate-200 first:border-t-0"
          >
            <div
              className={`mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-24 ${
                feature.reverse ? "lg:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">{feature.eyebrow}</p>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#0B1020] sm:text-4xl">
                  {feature.title}
                </h2>
                <p className="mt-5 max-w-xl leading-7 text-slate-600">{feature.description}</p>
                <ul className="mt-7 space-y-3">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-cyan-800" aria-hidden />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <ScreenshotPlaceholder
                name={feature.screenshot}
                label={`${feature.eyebrow} in Partrix`}
                className="rounded-xl bg-[#F7F8FA] sm:min-h-[400px]"
              />
            </div>
          </article>
        ))}
      </section>

      <section id="how-it-works" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Getting started</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#0B1020] sm:text-4xl">
            A clearer way to run the rental workflow.
          </h2>
        </div>
        <ol className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.number} className="border-t border-slate-300 py-6">
              <span className="text-sm font-semibold text-cyan-800">{step.number}</span>
              <h3 className="mt-4 text-lg font-semibold text-[#0B1020]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="audience" className="scroll-mt-24 border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Who it&apos;s for</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#0B1020] sm:text-4xl">
              Built for businesses that rent things.
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-slate-600">
              Partrix brings the essential rental workflow into one place for small and growing
              teams.
            </p>
          </div>
          <ul className="grid content-center gap-3 sm:grid-cols-2">
            {audience.map((business) => (
              <li key={business} className="flex min-h-16 items-center gap-3 border-b border-slate-200 px-1 py-4 text-base font-medium text-slate-800">
                <Package className="h-5 w-5 shrink-0 text-cyan-800" aria-hidden />
                {business}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#0B1020] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Made for rental work</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              One workspace for the work behind every rental.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            From inventory and booking records to payments, delivery planning, and returns, Partrix
            is shaped around the operational details rental teams manage every day.
          </p>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Pricing</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#0B1020] sm:text-4xl">
            The right plan for how you rent.
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Plan details and pricing are being finalized. No prices or feature limits are published
            until they are ready.
          </p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {[
            { name: "Starter", audience: "For smaller rental businesses." },
            { name: "Growth", audience: "For growing rental operations." },
            { name: "Scale", audience: "For larger teams and complex operations." },
          ].map((plan) => (
            <article key={plan.name} className="border border-slate-200 bg-white p-7">
              <h3 className="text-lg font-semibold text-[#0B1020]">{plan.name}</h3>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{plan.audience}</p>
              <p className="mt-6 border-t border-slate-200 pt-5 text-sm font-medium text-slate-500">
                Plan details coming soon
              </p>
            </article>
          ))}
        </div>
        <div className="mt-9 text-center">
          <Link
            href="/signup"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0B1020] px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Create your workspace
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="bg-cyan-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-16 sm:px-8 sm:py-20 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-[#0B1020] sm:text-4xl">
              Ready to run your rental business differently?
            </h2>
            <p className="mt-4 leading-7 text-slate-700">
              Manage inventory, bookings, customers, and operations from one place.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0B1020] px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Get started
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-10 border-b border-slate-200 pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" aria-label="Partrix home">
                <PartrixLogo size={38} textClassName="text-slate-900" className="[&_span:first-child]:shadow-none" />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
                Partrix — The Operating System for Rental Businesses.
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Product</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li><Link className="hover:text-slate-950" href="#product">Features</Link></li>
                <li><Link className="hover:text-slate-950" href="#pricing">Pricing</Link></li>
                <li><Link className="hover:text-slate-950" href="#how-it-works">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Solutions</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li><Link className="hover:text-slate-950" href="#audience">Event &amp; party rentals</Link></li>
                <li><Link className="hover:text-slate-950" href="#audience">Equipment rentals</Link></li>
                <li><Link className="hover:text-slate-950" href="#audience">Furniture rentals</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Get started</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li><Link className="hover:text-slate-950" href="/signup">Create an account</Link></li>
                <li><Link className="hover:text-slate-950" href="/login">Sign in</Link></li>
                <li><Link className="hover:text-slate-950" href="#how-it-works">Getting started</Link></li>
              </ul>
            </div>
          </div>
          <p className="pt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} Partrix. The Operating System for Rental Businesses.
          </p>
        </div>
      </footer>
    </main>
  );
}
