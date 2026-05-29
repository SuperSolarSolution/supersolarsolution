import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { ROICalculator } from '@/components/calculator/ROICalculator';

export default function Calculator() {
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Solar ROI Calculator – S³ Super Solar Solutions",
    "description": "Free pre-investment solar ROI calculator. Estimate Internal Rate of Return (IRR), cash flows, and payback period for solar asset investments in India. Compare lease vs PPA scenarios.",
    "url": "https://supersolarsolutions.in/calculator",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "featureList": [
      "Solar investment IRR calculation",
      "PPA vs lease comparison",
      "Cash flow projection",
      "Payback period estimation",
      "Pre-investment scenario modeling"
    ],
    "provider": {
      "@type": "Organization",
      "name": "S³ Super Solar Solutions",
      "url": "https://supersolarsolutions.in"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I calculate solar investment returns in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use S³'s free Solar ROI Calculator. Enter your investment amount, project capacity (kW), solar lease rate or PPA tariff, O&M costs, and project term. The calculator outputs IRR, net cash flows, and payback period for your scenario."
        }
      },
      {
        "@type": "Question",
        "name": "What is IRR in solar investment?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "IRR (Internal Rate of Return) is the annualized return rate that makes the net present value (NPV) of all cash flows equal to zero. For solar investments in India, a good IRR is typically 12–18%. S³ solar projects average 15% IRR."
        }
      },
      {
        "@type": "Question",
        "name": "What is a good payback period for solar investment in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A good payback period for solar assets in India is typically 5–8 years. With solar asset lifespans of 25+ years, this leaves 17–20 years of pure returns after payback."
        }
      },
      {
        "@type": "Question",
        "name": "PPA vs solar lease – which gives better returns?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Both models offer strong returns. Solar leases provide fixed monthly payments regardless of energy production, offering predictable cash flows. PPAs link returns to actual kWh generated, which can be higher in sunny locations. Use S³'s ROI Calculator to compare both scenarios for your specific project."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://supersolarsolutions.in" },
      { "@type": "ListItem", "position": 2, "name": "ROI Calculator", "item": "https://supersolarsolutions.in/calculator" }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Solar ROI Calculator India – Pre-Investment Returns & IRR | S³ Solar</title>
        <meta name="description" content="Free solar investment ROI calculator for India. Estimate IRR, cash flows, and payback period before committing capital. Compare PPA vs lease scenarios. S³ Solar." />
        <meta name="keywords" content="solar ROI calculator India, solar investment calculator, solar IRR calculator, PPA calculator India, solar payback period, solar returns calculator" />
        <link rel="canonical" href="https://supersolarsolutions.in/calculator" />
        <meta property="og:title" content="Solar ROI Calculator – Pre-Investment Returns | S³ Super Solar Solutions" />
        <meta property="og:description" content="Calculate your solar investment returns before committing capital. IRR, cash flow projections, and payback period for solar assets in India." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://supersolarsolutions.in/calculator" />
        <meta property="og:image" content="https://supersolarsolutions.in/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Solar ROI Calculator India | S³ Solar" />
        <meta name="twitter:description" content="Free solar investment ROI calculator. Estimate IRR and payback period for solar assets in India." />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <script type="application/ld+json">{JSON.stringify(calculatorSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Pre-Investment ROI Calculator</h1>
            <p className="mt-2 text-muted-foreground">
              Analyze projected returns before committing capital. Compare scenarios and visualize cash flows.
            </p>
          </div>
          <ROICalculator />
        </main>
      </div>
    </>
  );
}
