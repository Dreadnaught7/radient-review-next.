import { mkdir, writeFile } from 'node:fs/promises';

const API = 'https://public-api.wordpress.com/wp/v2/sites/256820440';
const SITE = 'https://theradientreview.com';
const FEED = `${SITE}/feed.xml`;
const OUTPUT = new URL('../public/feed.xml', import.meta.url);

const escapeXml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const stripHtml = (value = '') => String(value)
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#039;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/\s+/g, ' ')
  .trim();

const categoryNames = {
  28598973: 'Culture',
  299401: 'Media & Culture',
  790840: 'Markets',
  791145465: 'Public Systems',
  2049995: 'Technology',
  1: 'The Radient Review',
};

async function getPosts() {
  const params = new URLSearchParams({
    per_page: '100',
    orderby: 'date',
    order: 'desc',
    _fields: 'id,slug,date,modified,title,excerpt,categories',
  });
  const response = await fetch(`${API}/posts?${params}`);
  if (!response.ok) throw new Error(`WordPress API returned ${response.status}`);
  return response.json();
}

function item(post) {
  const title = stripHtml(post.title?.rendered || 'Untitled');
  const description = stripHtml(post.excerpt?.rendered || '');
  const link = `${SITE}/#/report/${encodeURIComponent(post.slug)}`;
  const category = categoryNames[post.categories?.[0]] || 'The Radient Review';
  const published = new Date(post.date).toUTCString();
  return `    <item>\n      <title>${escapeXml(title)}</title>\n      <link>${escapeXml(link)}</link>\n      <guid isPermaLink="true">${escapeXml(link)}</guid>\n      <pubDate>${escapeXml(published)}</pubDate>\n      <category>${escapeXml(category)}</category>\n      <dc:creator>The Radient Review</dc:creator>\n      <description>${escapeXml(description)}</description>\n    </item>`;
}

const posts = await getPosts();
const lastBuildDate = new Date().toUTCString();
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">\n  <channel>\n    <title>The Radient Review</title>\n    <link>${SITE}</link>\n    <description>Independent analysis. Clear context. Open questions.</description>\n    <language>en-us</language>\n    <lastBuildDate>${lastBuildDate}</lastBuildDate>\n    <ttl>60</ttl>\n    <atom:link href="${FEED}" rel="self" type="application/rss+xml" />\n${posts.map(item).join('\n')}\n  </channel>\n</rss>\n`;

await mkdir(new URL('../public/', import.meta.url), { recursive: true });
await writeFile(OUTPUT, xml, 'utf8');
console.log(`Generated RSS feed with ${posts.length} items at public/feed.xml`);
