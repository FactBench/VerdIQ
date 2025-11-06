# Analytics Configuration Guide

## Google Analytics 4 Setup

### Current Configuration
- **Measurement ID**: G-CXPNJ0FEG7
- **API Secret**: e3a2Ckgp8xx-HGm9g (in .env file)
- **Website**: https://factbench.github.io/VerdIQ/

### Integration Code
Already included in all pages:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CXPNJ0FEG7"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-CXPNJ0FEG7');
</script>
```

## wecantrack Integration

### Purpose
Track affiliate link clicks and conversions automatically.

### Configuration
- Dashboard: https://app.wecantrack.com/
- Website URL: https://factbench.github.io/VerdIQ/
- Integration: Automatic link tracking enabled

### How It Works
1. wecantrack detects affiliate links automatically
2. Wraps links with tracking parameters
3. Reports clicks and conversions in dashboard
4. Integrates with GA4 for unified reporting

## Google Search Console

### Verification
Already verified and configured.

### Key Metrics to Monitor
- Total clicks and impressions
- Average position for target keywords
- Page indexing status
- Mobile usability issues
- Core Web Vitals

### Weekly Tasks
1. Check for new coverage issues
2. Review top performing pages
3. Identify ranking opportunities
4. Submit new pages for indexing

## Bing Webmaster Tools

### Current Status
Site verified and indexed.

### Key Tasks
- Submit sitemap.xml after updates
- Monitor crawl errors
- Review SEO reports

## Performance Monitoring

### Key Metrics
- Page load speed (target: < 3 seconds)
- Core Web Vitals (LCP, FID, CLS)
- Bounce rate
- Average session duration
- Conversion rate (affiliate clicks → purchases)

### Monthly Review Checklist
- [ ] GA4: Review traffic sources and top pages
- [ ] wecantrack: Analyze affiliate performance
- [ ] Search Console: Check ranking changes
- [ ] Bing: Review indexing status
- [ ] Performance: Check Core Web Vitals
