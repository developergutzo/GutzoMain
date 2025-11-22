Gutzo SEO & Google Search Console — Quick Guide

What I changed
- Updated homepage metadata in `index.html` and `src/public/index.html`:
  - Title, description, canonical URL (https://gutzo.in/)
  - Open Graph and Twitter card metadata
  - JSON-LD (LocalBusiness) with contact number +91 8903589068 and social links

Why this fixes the Google snippet
- Google prefers an explicit <title> and meta description. Previously the site or a linked resource contained a design name such as "FNL1_Gutzo..." which Google may have used when indexing. The new tags make the correct title/description explicit.

Steps to request re-indexing (Google Search Console)
1. Open Google Search Console (https://search.google.com/search-console).
2. Add and verify ownership of `https://gutzo.in` if not already done.
3. In the Search Console, go to "URL inspection" and paste `https://gutzo.in/`.
4. Click "Request indexing". Google will queue a recrawl; changes often appear within minutes to a few days.
5. Optionally submit your sitemap (https://gutzo.in/sitemap.xml) via "Sitemaps" in Search Console.

Checklist / follow-ups
- Deploy the updated site (build + deploy). I can deploy for you or provide commands.
- Ensure `robots.txt` allows crawling (e.g., `Disallow:` should not block the homepage).
- Wait and monitor Search Console for any crawl/indexing errors.

Commands to build and deploy locally
- Build the site:

```bash
npm run build
```

- (Optional) Deploy using your existing script (this repository includes `deploy-simple.sh`):

```bash
chmod +x deploy-simple.sh
./deploy-simple.sh
```

Notes & tips
- If you manage multiple versions (staging, dev), make sure only the production site at `https://gutzo.in` is indexed for the main title.
- You can update social preview images at `/assets/gutzo-og.png` for a better-looking link preview.
- If you want, I can also add a `/sitemap.xml` generator and wire it into the build.

If you'd like, I can now run a local build to verify (I will) and then help you deploy or prepare the exact steps for re-indexing. Let me know how you'd like to proceed.