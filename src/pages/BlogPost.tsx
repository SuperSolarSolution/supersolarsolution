import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getBlogPost, blogPosts } from '@/data/blogPosts';
import { Calendar, Clock, ArrowRight, Sun, ArrowLeft, Share2, Bookmark, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Related posts (same category, exclude current)
  const related = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);
  const fallbackRelated = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3 - related.length);
  const relatedPosts = [...related, ...fallbackRelated].slice(0, 3);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.metaDescription,
    "url": `https://supersolarsolutions.in/blog/${post.slug}`,
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    "image": `https://supersolarsolutions.in/og/${post.coverImage}.jpg`,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role,
      "worksFor": {
        "@type": "Organization",
        "name": "S³ Super Solar Solutions"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "S³ Super Solar Solutions",
      "logo": {
        "@type": "ImageObject",
        "url": "https://supersolarsolutions.in/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://supersolarsolutions.in/blog/${post.slug}`
    },
    "keywords": post.tags.join(", "),
    "articleSection": post.category,
    "wordCount": post.content.split(" ").length,
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://supersolarsolutions.in" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://supersolarsolutions.in/blog" },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://supersolarsolutions.in/blog/${post.slug}` },
    ]
  };

  return (
    <>
      <Helmet>
        <title>{post.metaTitle}</title>
        <meta name="description" content={post.metaDescription} />
        <meta name="keywords" content={post.tags.join(', ')} />
        <link rel="canonical" href={`https://supersolarsolutions.in/blog/${post.slug}`} />
        <meta property="og:title" content={post.metaTitle} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://supersolarsolutions.in/blog/${post.slug}`} />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:author" content={post.author.name} />
        <meta property="article:section" content={post.category} />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.metaTitle} />
        <meta name="twitter:description" content={post.metaDescription} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Banner */}
        <div className="border-b border-border bg-gradient-to-br from-primary/6 via-amber-50/20 to-background">
          <div className="container py-10 lg:py-14">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium truncate max-w-xs">{post.category}</span>
            </nav>

            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2 mb-5">
                <Badge className="bg-primary/10 text-primary border-0 font-medium">
                  {post.category}
                </Badge>
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs border-border">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl leading-[1.15] mb-5 tracking-tight">
                {post.title}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
                {post.excerpt}
              </p>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {post.author.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{post.author.name}</p>
                    <p className="text-xs text-muted-foreground">{post.author.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {post.readingTime} min read
                  </span>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    id="blog-share-btn"
                    onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Share article"
                    title="Share article"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    id="blog-bookmark-btn"
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Bookmark article"
                    title="Bookmark article"
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-12 lg:py-16">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12 max-w-6xl">

            {/* Article Body */}
            <article
              id="blog-article-content"
              className="prose prose-neutral dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-p:leading-relaxed prose-p:text-base prose-li:text-base prose-table:text-sm prose-code:text-primary prose-code:bg-primary/8 prose-code:rounded prose-code:px-1 prose-pre:bg-muted prose-pre:border prose-pre:border-border max-w-none"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Author Card */}
              <Card className="p-5 border-border">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Written by</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {post.author.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{post.author.name}</p>
                    <p className="text-xs text-muted-foreground">{post.author.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Expert at S³ Super Solar Solutions with deep domain experience in solar energy financing and investment.
                </p>
              </Card>

              {/* Tags */}
              <Card className="p-5 border-border">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Topics</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="text-xs bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-full px-3 py-1.5 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </Card>

              {/* CTA Card */}
              <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/5 to-amber-50/30 dark:from-primary/10 dark:to-card">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <Sun className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Ready to Invest?</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  Calculate your projected returns on solar assets with our free ROI calculator.
                </p>
                <div className="space-y-2">
                  <Link
                    to="/calculator"
                    id="sidebar-cta-calculator"
                    className="block w-full text-center bg-primary text-primary-foreground font-semibold text-sm py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Try ROI Calculator
                  </Link>
                  <Link
                    to="/register"
                    id="sidebar-cta-register"
                    className="block w-full text-center border border-border text-foreground font-semibold text-sm py-2.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    Create Free Account
                  </Link>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-5 border-border">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">S³ Solar at a Glance</p>
                <div className="space-y-4">
                  {[
                    { label: 'Assets Under Mgmt', value: '₹120 Cr+' },
                    { label: 'Average IRR', value: '15%' },
                    { label: 'Active Investors', value: '1,200+' },
                    { label: 'Solar Projects', value: '24+' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{stat.label}</span>
                      <span className="font-bold text-primary">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </aside>
          </div>

          {/* Back Navigation */}
          <div className="mt-12 pt-8 border-t border-border max-w-6xl">
            <Link
              to="/blog"
              id="blog-back-link"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Back to All Articles
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="py-14 bg-muted/30 border-t border-border">
            <div className="container">
              <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map((related) => (
                  <Link key={related.slug} to={`/blog/${related.slug}`} className="group">
                    <Card className="h-full p-6 border-border hover:border-primary/40 transition-all hover:shadow-md">
                      <div className="h-1.5 w-12 rounded-full bg-primary mb-5" />
                      <Badge variant="outline" className="text-xs mb-3 border-primary/30 text-primary">
                        {related.category}
                      </Badge>
                      <h3 className="font-bold mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-3">
                        {related.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {related.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {related.readingTime} min</span>
                        <span className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
                          Read <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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
                <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
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
