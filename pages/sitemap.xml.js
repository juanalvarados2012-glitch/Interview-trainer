const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://interviewhub.app");

const PAGES = [
  { path: "/",        priority: "1.0", changefreq: "weekly"  },
  { path: "/app",     priority: "0.9", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly"  },
];

export default function Sitemap() {}

export async function getServerSideProps({ res }) {
  const urls = PAGES.map(
    ({ path, priority, changefreq }) => `
  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(xml);
  res.end();
  return { props: {} };
}
