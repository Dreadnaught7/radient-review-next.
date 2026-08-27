import fs from 'node:fs';

const path = new URL('../src/main.tsx', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

const replaceIfMissing = (sentinel, from, to, label) => {
  if (source.includes(sentinel)) return;
  if (!source.includes(from)) {
    console.warn(`Featured-image patch skipped at ${label}: source shape already changed.`);
    return;
  }
  source = source.replace(from, to);
};

replaceIfMissing(
  'image?: ImageRef;',
  `  categorySlug: string;\n};`,
  `  categorySlug: string;\n  image?: ImageRef;\n};`,
  'Post image field',
);

replaceIfMissing(
  `featured_media,_links,_embedded`,
  `const SUMMARY_FIELDS = 'id,slug,date,title,excerpt,categories';`,
  `const SUMMARY_FIELDS = 'id,slug,date,title,excerpt,categories,featured_media,_links,_embedded';`,
  'summary fields',
);

replaceIfMissing(
  'WordPress featured_media is canonical',
  `// Editorial rule: photography is curated per report. No automatic image guessing.`,
  `// WordPress featured_media is canonical for all new reports. Legacy mappings remain only as fallback.`,
  'editorial comment',
);

replaceIfMissing(
  'const getFeaturedImage =',
  `const toPost = (item: any): Post => {`,
  `const getFeaturedImage = (item: any): ImageRef | undefined => {\n  const media = item?._embedded?.['wp:featuredmedia']?.[0];\n  if (!media?.source_url) return undefined;\n  return { src: media.source_url, credit: cleanText(media?.caption?.rendered || '') || 'The Radient Review' };\n};\nconst toPost = (item: any): Post => {`,
  'featured image resolver',
);

replaceIfMissing(
  'const image = getFeaturedImage(item);',
  `  const category = categories[item.categories?.[0]] || { name: 'The Radient Review', slug: 'uncategorized' };\n  return {`,
  `  const category = categories[item.categories?.[0]] || { name: 'The Radient Review', slug: 'uncategorized' };\n  const image = getFeaturedImage(item);\n  return {`,
  'featured image assignment',
);

replaceIfMissing(
  `    image,\n  };`,
  `    categorySlug: category.slug,\n  };`,
  `    categorySlug: category.slug,\n    image,\n  };`,
  'post image property',
);

replaceIfMissing(
  'const hydratePost = async',
  `function hash(input: string) {`,
  `const hydratePost = async (item: any): Promise<Post> => {\n  const post = toPost(item);\n  if (post.image || !item?.featured_media) return post;\n  try {\n    const response = await fetch(\`${'${API}'}/media/${'${item.featured_media}'}?_fields=source_url,caption\`);\n    if (!response.ok) return post;\n    const media = await response.json();\n    if (!media?.source_url) return post;\n    return { ...post, image: { src: media.source_url, credit: cleanText(media?.caption?.rendered || '') || 'The Radient Review' } };\n  } catch {\n    return post;\n  }\n};\n\nfunction hash(input: string) {`,
  'featured media fallback hydrator',
);

replaceIfMissing(
  `const image = post.image || fixedImages[post.slug] || null;`,
  `  const image = fixedImages[post.slug] || null;`,
  `  const image = post.image || fixedImages[post.slug] || null;`,
  'ArticleImage source',
);

replaceIfMissing(
  `_embed=wp:featuredmedia&_fields=${'${SUMMARY_FIELDS}'}`,
  `fetch(\`${'${API}'}/posts?per_page=6&_fields=${'${SUMMARY_FIELDS}'}\`)`,
  `fetch(\`${'${API}'}/posts?per_page=6&_embed=wp:featuredmedia&_fields=${'${SUMMARY_FIELDS}'}\`)`,
  'home feed embed',
);

if (!source.includes(`posts?per_page=100&_embed=wp:featuredmedia`)) {
  source = source.replace(
    `fetch(\`${'${API}'}/posts?per_page=100&_fields=${'${SUMMARY_FIELDS}'}\`)`,
    `fetch(\`${'${API}'}/posts?per_page=100&_embed=wp:featuredmedia&_fields=${'${SUMMARY_FIELDS}'}\`)`,
  );
}

if (!source.includes(`posts?slug=${'${encodeURIComponent(slug)}'}&_embed=wp:featuredmedia`)) {
  source = source.replace(
    `fetch(\`${'${API}'}/posts?slug=${'${encodeURIComponent(slug)}'}&_fields=id,slug,date,title,excerpt,content,categories\`)`,
    `fetch(\`${'${API}'}/posts?slug=${'${encodeURIComponent(slug)}'}&_embed=wp:featuredmedia&_fields=id,slug,date,title,excerpt,content,categories,featured_media,_links,_embedded\`)`,
  );
}

replaceIfMissing(
  `Promise.all(items.map(hydratePost))`,
  `.then(items => setPosts(items.map(toPost)))`,
  `.then(async items => setPosts(await Promise.all(items.map(hydratePost))))`,
  'home fallback hydration',
);

if (!source.includes(`setArchiveLoaded(true); })`) || !source.includes(`items.map(hydratePost)`)) {
  source = source.replace(
    `.then(items => { setPosts(items.map(toPost)); setArchiveLoaded(true); })`,
    `.then(async items => { setPosts(await Promise.all(items.map(hydratePost))); setArchiveLoaded(true); })`,
  );
}

if (!source.includes(`setPost(await hydratePost(items[0]))`)) {
  source = source.replace(
    `.then(items => active && items[0] && setPost(toPost(items[0])))`,
    `.then(async items => active && items[0] && setPost(await hydratePost(items[0])))`,
  );
}

if (!source.includes('const hasRealImage = Boolean(post.image || fixedImages[post.slug]);')) {
  source = source.replace(
    `  return <section className="interior shell"><a className="back" href="#/archive">← Back to reports</a><article className="article"><ArticleImage post={post} priority/><header>`,
    `  const hasRealImage = Boolean(post.image || fixedImages[post.slug]);\n  return <section className="interior shell"><a className="back" href="#/archive">← Back to reports</a><article className="article">{hasRealImage && <ArticleImage post={post} priority/>}<header>`,
  );
}

const required = [
  'image?: ImageRef;',
  'const getFeaturedImage =',
  'const hydratePost = async',
  'const image = post.image || fixedImages[post.slug] || null;',
  '_embed=wp:featuredmedia',
];
const missing = required.filter(token => !source.includes(token));
if (missing.length) throw new Error(`Featured-image patch incomplete: ${missing.join(', ')}`);

fs.writeFileSync(path, source);
console.log('Applied canonical WordPress featured-image renderer patch.');
