import fs from 'node:fs';

const path = new URL('../src/main.tsx', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

const replaceOnce = (from, to, label) => {
  if (source.includes(to)) return;
  if (!source.includes(from)) throw new Error(`Featured-image patch failed at: ${label}`);
  source = source.replace(from, to);
};

replaceOnce(
  `  categorySlug: string;\n};`,
  `  categorySlug: string;\n  image?: ImageRef;\n};`,
  'Post image field',
);

replaceOnce(
  `const SUMMARY_FIELDS = 'id,slug,date,title,excerpt,categories';`,
  `const SUMMARY_FIELDS = 'id,slug,date,title,excerpt,categories,featured_media,_links,_embedded';`,
  'summary fields',
);

replaceOnce(
  `// Editorial rule: photography is curated per report. No automatic image guessing.`,
  `// WordPress featured_media is canonical for all new reports. Legacy mappings remain only as fallback.`,
  'editorial comment',
);

replaceOnce(
  `const toPost = (item: any): Post => {\n  const category = categories[item.categories?.[0]] || { name: 'The Radient Review', slug: 'uncategorized' };\n  return {`,
  `const getFeaturedImage = (item: any): ImageRef | undefined => {\n  const media = item?._embedded?.['wp:featuredmedia']?.[0];\n  if (!media?.source_url) return undefined;\n  return { src: media.source_url, credit: cleanText(media?.caption?.rendered || '') || 'The Radient Review' };\n};\nconst toPost = (item: any): Post => {\n  const category = categories[item.categories?.[0]] || { name: 'The Radient Review', slug: 'uncategorized' };\n  const image = getFeaturedImage(item);\n  return {`,
  'featured image resolver',
);

replaceOnce(
  `    categorySlug: category.slug,\n  };`,
  `    categorySlug: category.slug,\n    image,\n  };`,
  'post image assignment',
);

replaceOnce(
  `  const image = fixedImages[post.slug] || null;`,
  `  const image = post.image || fixedImages[post.slug] || null;`,
  'ArticleImage source',
);

replaceOnce(
  `fetch(\`${'${API}'}/posts?per_page=6&_fields=${'${SUMMARY_FIELDS}'}\`)`,
  `fetch(\`${'${API}'}/posts?per_page=6&_embed=wp:featuredmedia&_fields=${'${SUMMARY_FIELDS}'}\`)`,
  'home feed embed',
);

replaceOnce(
  `fetch(\`${'${API}'}/posts?per_page=100&_fields=${'${SUMMARY_FIELDS}'}\`)`,
  `fetch(\`${'${API}'}/posts?per_page=100&_embed=wp:featuredmedia&_fields=${'${SUMMARY_FIELDS}'}\`)`,
  'archive feed embed',
);

replaceOnce(
  `fetch(\`${'${API}'}/posts?slug=${'${encodeURIComponent(slug)}'}&_fields=id,slug,date,title,excerpt,content,categories\`)`,
  `fetch(\`${'${API}'}/posts?slug=${'${encodeURIComponent(slug)}'}&_embed=wp:featuredmedia&_fields=id,slug,date,title,excerpt,content,categories,featured_media,_links,_embedded\`)`,
  'report embed',
);

replaceOnce(
  `const toPost = (item: any): Post => {`,
  `const hydratePost = async (item: any): Promise<Post> => {\n  const post = toPost(item);\n  if (post.image || !item?.featured_media) return post;\n  try {\n    const response = await fetch(\`${'${API}'}/media/${'${item.featured_media}'}?_fields=source_url,caption\`);\n    if (!response.ok) return post;\n    const media = await response.json();\n    if (!media?.source_url) return post;\n    return { ...post, image: { src: media.source_url, credit: cleanText(media?.caption?.rendered || '') || 'The Radient Review' } };\n  } catch {\n    return post;\n  }\n};\nconst toPost = (item: any): Post => {`,
  'featured media fallback hydrator',
);

replaceOnce(
  `.then(items => setPosts(items.map(toPost)))`,
  `.then(async items => setPosts(await Promise.all(items.map(hydratePost))))`,
  'home fallback hydration',
);

replaceOnce(
  `.then(items => { setPosts(items.map(toPost)); setArchiveLoaded(true); })`,
  `.then(async items => { setPosts(await Promise.all(items.map(hydratePost))); setArchiveLoaded(true); })`,
  'archive fallback hydration',
);

replaceOnce(
  `.then(items => active && items[0] && setPost(toPost(items[0])))`,
  `.then(async items => active && items[0] && setPost(await hydratePost(items[0])))`,
  'report fallback hydration',
);

// A report with no real featured image must never reserve a giant decorative hero slot.
replaceOnce(
  `  return <section className="interior shell"><a className="back" href="#/archive">← Back to reports</a><article className="article"><ArticleImage post={post} priority/><header>`,
  `  const hasRealImage = Boolean(post.image || fixedImages[post.slug]);\n  return <section className="interior shell"><a className="back" href="#/archive">← Back to reports</a><article className="article">{hasRealImage && <ArticleImage post={post} priority/>}<header>`,
  'article fallback collapse',
);

fs.writeFileSync(path, source);
console.log('Applied canonical WordPress featured-image renderer patch.');
