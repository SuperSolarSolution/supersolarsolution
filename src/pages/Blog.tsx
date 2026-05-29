import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { blogPosts, getAllCategories } from '@/data/blogPosts';
import { Calendar, Clock, ArrowRight, Sun, TrendingUp, BookOpen, Filter } from 'lucide-react';
import { useState } from 'react';

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categories = ['All', ...getAllCategories()].filter(Boolean);
  const filtered = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);
  const featured = blogPosts.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured || activeCategory !== 'All');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "S³ Solar Blog – Solar Energy & Investment Insights",
    "description": "Expert insights on solar energy investment, financing, and sustainability in India from S³ Super Solar Solutions.",
    "url": "https://supersolarsolutions.in/blog",
    "publisher": {
      "@type": "Organization",
      "name": "S³ Super Solar Solutions",
      "logo": {
        "@type": "ImageObject",
        "url": "https://supersolarsolutions.in/logo.png"
      }
    },
    "blogPost": blogPosts.map((post) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.metaDescription,
      "url": `https://supersolarsolutions.in/blog/${post.slug}`,
      "datePublished": post.publishedAt,
      "author": {
        "@type": "Person",
        "name": post.author.name,
        "jobTitle": post.author.role,
      },
    })),
  };

  return (
    <>
      <Helmet>
        <title>Solar Energy & Investment Blog India | S³ Super Solar Solutions</title>
        <meta
          name="description"
          content="Expert articles on solar energy investment in India, PPA financing, NBFC solar lending, corporate ESG, and government solar policies. Updated monthly by S³ Solar experts."
        />
        <meta name="keywords" content="solar energy blog India, solar investment articles, PPA guide India, solar financing, renewable energy blog" />
        <link rel="canonical" href="https://supersolarsolutions.in/blog" />
        <meta property="og:title" content="Solar Energy & Investment Blog | S³ Super Solar Solutions" />
        <meta property="og:description" content="Expert articles on solar energy investment, financing, and sustainability in India." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://supersolarsolutions.in/blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Solar Energy Blog India | S³ Solar" />
        <meta name="twitter:description" content="Expert insights on solar investment, PPA financing, and corporate solar in India." />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative overflow-hidden py-16 lg:py-24 border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-amber-50/30 dark:to-amber-950/10" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="container relative">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <BookOpen className="h-4 w-4" />
                S³ Solar Knowledge Hub
              </div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl mb-6 leading-[1.1]">
                Solar Energy &{' '}
                <span className="text-primary">Investment Insights</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-2xl leading-relaxed">
                Expert analysis on solar energy investment in India — covering PPAs, NBFC financing, 
                government policy, ESG strategy, and everything you need to make smarter solar decisions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 items-center text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-primary" /> {blogPosts.length} Expert Articles</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-1.5"><Sun className="h-4 w-4 text-primary" /> Updated Monthly</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-primary" /> India-Focused</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featured && activeCategory === 'All' && (
          <section className="py-12 border-b border-border">
            <div className="container">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-5">Featured Article</p>
              <Link to={`/blog/${featured.slug}`} className="group block">
                <div className="grid lg:grid-cols-5 gap-6 rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
                  <div className="lg:col-span-2 bg-gradient-to-br from-primary/20 via-amber-100/40 to-amber-50 dark:from-primary/30 dark:via-amber-900/20 dark:to-card min-h-[240px] flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                        <Sun className="h-10 w-10 text-primary" />
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                        {featured.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="lg:col-span-3 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {featured.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-muted text-muted-foreground rounded-full px-3 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">
                        {featured.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        {featured.excerpt}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {featured.author.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{featured.author.name}</p>
                          <p className="text-xs text-muted-foreground">{featured.author.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(featured.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {featured.readingTime} min read
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                      Read Full Article <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Category Filter + Grid */}
        <section className="py-12">
          <div className="container">
            {/* Filter Bar */}
            <div className="flex items-center gap-3 mb-10 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground mr-2">
                <Filter className="h-4 w-4" /> Filter:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  id={`blog-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Posts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(activeCategory === 'All' ? blogPosts.filter(p => !p.featured) : filtered).map((post) => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
                  <Card className="h-full overflow-hidden border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg flex flex-col">
                    {/* Card Top Colour Band */}
                    <div className="h-2 bg-gradient-to-r from-primary via-amber-400 to-amber-300" />

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <Badge variant="outline" className="text-xs shrink-0 border-primary/30 text-primary">
                          {post.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime} min
                        </span>
                      </div>

                      <h2 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-3">
                        {post.title}
                      </h2>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed flex-1">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs bg-muted/70 text-muted-foreground rounded-full px-2.5 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {post.author.avatar}
                          </div>
                          <span className="text-xs text-muted-foreground">{post.author.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.publishedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="mt-4 text-sm font-medium text-primary flex items-center gap-1.5 group-hover:gap-3 transition-all">
                        Read Article <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No articles found for this category.
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-amber-50/30 to-background border-t border-border">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                <Sun className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Get Solar Insights in Your Inbox
              </h2>
              <p className="text-muted-foreground mb-8">
                Monthly digest of solar investment opportunities, policy updates, and market analysis — 
                curated by S³ Solar experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/register"
                  id="blog-cta-register"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Free Account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/calculator"
                  id="blog-cta-calculator"
                  className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-semibold px-6 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  Try ROI Calculator
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Sun className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">S³ – Super Solar Solutions</span>
              </div>
              <nav className="flex gap-6 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <Link to="/blog" className="hover:text-foreground transition-colors font-medium text-foreground">Blog</Link>
                <Link to="/calculator" className="hover:text-foreground transition-colors">Calculator</Link>
                <Link to="/register" className="hover:text-foreground transition-colors">Get Started</Link>
              </nav>
              <p className="text-xs text-muted-foreground">© 2024 S³ Solar. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
