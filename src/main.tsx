import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ArrowRight, Menu, Search, X } from 'lucide-react';
import './styles.css';

type ImageRef = { src: string; credit: string };
type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  categorySlug: string;
};
type PageData = { title: string; content: string };

const API = 'https://public-api.wordpress.com/wp/v2/sites/256820440';
const SUMMARY_FIELDS = 'id,slug,date,title,excerpt,categories';
const IMAGE_CACHE_VERSION = 'rr-img-v2-';
const categories: Record<number, { name: string; slug: string }> = {
  28598973: { name: 'Culture', slug: 'culture-pie' },
  299401: { name: 'Media & Culture', slug: 'media-culture' },
  790840: { name: 'Markets', slug: 'money-business' },
  791145465: { name: 'Public Systems', slug: 'systems-everyday-life' },
  2049995: { name: 'Technology', slug: 'technology-infrastructure' },
  1: { name: 'The Radient Review', slug: 'uncategorized' },
};

const fixedImages: Record<string, ImageRef> = {
  'who-threatens-knicks-repeat-2026-offseason': { src: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Knicks_playing_at_Madison_Square_Garden.jpg', credit: 'Wikimedia Commons' },
  'knicks-ring-night-garden-53-years-2026': { src: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Madison_Square_Garden_1968.jpeg', credit: 'Wikimedia Commons' },
  'bk-loves-mj-spike-lee-michael-jackson-fort-greene-2026': { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Fort_Greene_Parkhouse_jeh.JPG/1280px-Fort_Greene_Parkhouse_jeh.JPG', credit: 'Wikimedia Commons' },
  'ai-agents-spend-company-money-who-audits-the-purchase': { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Technician_with_laptop_working_on_server_rack_at_NERSC.jpg/1280px-Technician_with_laptop_working_on_server_rack_at_NERSC.jpg', credit: 'Wikimedia Commons' },
  'google-ai-agents-finance-who-audits-the-agent': { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Rear_of_rack_at_NERSC_data_center_-_closeup.jpg/1280px-Rear_of_rack_at_NERSC_data_center_-_closeup.jpg', credit: 'Wikimedia Commons' },
  'ai-trading-copilot-human-confirmation': { src: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Floor_of_Toronto_Stock_Exchange_1956.jpg', credit: 'Wikimedia Commons' },
};

const imageCache = new Map<string, ImageRef>();
const cleanText = (html = '') => new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() || '';
const cleanHtml = (html = '') => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed').forEach(node => node.remove());
  doc.querySelectorAll('*').forEach(node => [...node.attributes].forEach(attr => attr.name.startsWith('on') && node.removeAttribute(attr.name)));
  return doc.body.innerHTML;
};
const toPost = (item: any): Post => {
  const category = categories[item.categories?.[0]] || { name: 'The Radient Review', slug: 'uncategorized' };
  return {
    id: item.id,
    slug: item.slug,
    title: cleanText(item.title?.rendered),
    excerpt: cleanText(item.excerpt?.rendered),
    content: item.content?.rendered ? cleanHtml(item.content.rendered) : '',
    date: item.date,
    category: category.name,
    categorySlug: category.slug,
  };
};
function hash(input: string) {
  let value = 0;
  for (let i = 0; i < input.length; i++) value = ((value << 5) - value + input.charCodeAt(i)) | 0;
  return Math.abs(value);
}
const imageStopWords = new Set(['the','and','that','this','with','from','into','your','their','they','them','who','what','when','where','why','how','are','was','were','has','have','had','can','could','would','should','just','more','less','than','then','about','inside','outside','after','before','does','did','for','its','our','new','report','review','radient']);
function imageKeywords(post: Post) {
  const words = post.title.toLowerCase().replace(/radient screen #\d+/g, ' ').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(word => word.length >= 3 && !imageStopWords.has(word));
  return [...new Set(words)].slice(0, 7);
}
function candidateScore(page: any, keywords: string[]) {
  const title = String(page.title || '').replace(/^File:/i, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  if (/\b(logo|icon|diagram|chart|coat of arms|flag|seal|screenshot|scan|symbol)\b/i.test(title)) return -1;
  let score = 0;
  keywords.forEach((word, index) => {
    if (title.includes(word)) score += Math.max(2, 7 - index);
  });
  if (keywords.length >= 2 && title.includes(`${keywords[0]} ${keywords[1]}`)) score += 8;
  return score;
}
async function resolveImage(post: Post): Promise<ImageRef | null> {
  if (fixedImages[post.slug]) return fixedImages[post.slug];
  if (imageCache.has(post.slug)) return imageCache.get(post.slug)!;
  const cacheKey = `${IMAGE_CACHE_VERSION}${post.slug}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached) as ImageRef;
    imageCache.set(post.slug, parsed);
    return parsed;
  }
  try {
    const keywords = imageKeywords(post);
    if (!keywords.length) return null;
    const query = encodeURIComponent(keywords.join(' '));
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`);
    const data = await response.json();
    const choices = Object.values<any>(data.query?.pages || {}).filter((page: any) => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url);
    if (!choices.length) return null;
    const ranked = choices.map((page: any, index: number) => ({ page, index, score: candidateScore(page, keywords) })).filter(item => item.score >= 2).sort((a, b) => b.score - a.score || a.index - b.index);
    if (!ranked.length) return null;
    const selected = ranked[0].page;
    const src = selected.imageinfo?.[0]?.thumburl || selected.imageinfo?.[0]?.url;
    const result = { src, credit: 'Wikimedia Commons' };
    imageCache.set(post.slug, result);
    sessionStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch { return null; }
}

function ArticleImage({ post, priority = false, compact = false }: { post: Post; priority?: boolean; compact?: boolean }) {
  const [image, setImage] = useState<ImageRef | null>(fixedImages[post.slug] || null);
  useEffect(() => {
    let active = true;
    setImage(fixedImages[post.slug] || null);
    if (fixedImages[post.slug]) return () => { active = false; };
    const run = () => resolveImage(post).then(result => active && setImage(result));
    if (priority) run();
    else {
      const id = window.setTimeout(run, 650);
      return () => { active = false; window.clearTimeout(id); };
    }
    return () => { active = false; };
  }, [post.slug, priority]);
  return <div className={`media ${compact ? 'media-compact' : ''}`}>
    {image ? <img src={image.src} alt="" loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : 'auto'} /> : <div className={`signal signal-${hash(post.slug) % 4}`} />}
    <span>{post.category}</span>{image && <small>{image.credit}</small>}
  </div>;
}

function Brand() { return <a className="brand" href="#/"><span className="brand-mark">R</span><span><b>The Radient Review</b><small>FIND THE SIGNAL. KEEP THE COMPLEXITY.</small></span></a>; }
function Header({ onSearch }: { onSearch: () => void }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="shell header-inner"><Brand/><nav className={open ? 'nav-open' : ''}><a href="#/archive" onClick={() => setOpen(false)}>Reports</a><a href="#/topics" onClick={() => setOpen(false)}>Topics</a><a href="#/page/research-services" onClick={() => setOpen(false)}>Research</a><a href="#/page/about" onClick={() => setOpen(false)}>About</a><a href="#/page/support" onClick={() => setOpen(false)}>Support</a></nav><div className="header-actions"><button className="icon-button" aria-label="Search" onClick={onSearch}><Search size={17}/></button><a className="subscribe" href="#/page/support">Subscribe</a><button className="menu-button" aria-label="Menu" onClick={() => setOpen(v => !v)}>{open ? <X size={20}/> : <Menu size={20}/>}</button></div></div></header>;
}
function SectionHead({ eyebrow, title, link, label }: { eyebrow: string; title: string; link?: string; label?: string }) { return <div className="section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{link && <a href={link}>{label || 'View all'} <ArrowRight size={15}/></a>}</div>; }
function ReportCard({ post, compact = false }: { post: Post; compact?: boolean }) { return <article className={`report-card ${compact ? 'compact-card' : ''}`}><a href={`#/report/${post.slug}`}><ArticleImage post={post} compact={compact}/><div className="card-copy"><p className="eyebrow accent">{post.category}</p><h3>{post.title}</h3>{!compact && <p>{post.excerpt}</p>}<span>Read report <ArrowRight size={14}/></span></div></a></article>; }

function Home({ posts }: { posts: Post[] }) {
  const lead = posts[0]; if (!lead) return <Loading/>;
  return <><section className="hero shell"><div className="hero-copy"><p className="eyebrow">INDEPENDENT · CLEAR CONTEXT · OPEN QUESTIONS</p><h1>Find the signal.<em>Keep the complexity.</em></h1><p className="lede">Independent reports on technology, culture, markets, public systems and the patterns connecting them. Clear context without flattening the hard parts.</p><div className="hero-actions"><a className="primary" href="#/archive">Explore reports <ArrowRight size={15}/></a><a className="secondary" href="#/page/research-services">How we work</a></div></div><a className="hero-feature" href={`#/report/${lead.slug}`}><ArticleImage post={lead} priority/><div><p className="eyebrow accent">LATEST SIGNAL</p><h2>{lead.title}</h2></div></a></section><section className="method-band"><div className="shell method-grid"><div><span>01</span><b>Signal</b></div><div><span>02</span><b>Evidence</b></div><div><span>03</span><b>Dissonance</b></div><div><span>04</span><b>Alignment</b></div><div><span>05</span><b>Resonance</b></div></div></section><section className="section shell"><SectionHead eyebrow="FEATURED REPORT" title="Independent analysis, built to hold up." link="#/archive" label="Latest reports"/><div className="featured-layout"><ArticleImage post={lead}/><div className="featured-copy"><p className="eyebrow accent">{lead.category}</p><h2>{lead.title}</h2><p>{lead.excerpt}</p><a href={`#/report/${lead.slug}`}>Read the featured report <ArrowRight size={15}/></a></div></div></section><section className="section tinted"><div className="shell"><SectionHead eyebrow="TRENDING NOW" title="Signals worth following."/><div className="trending-grid">{posts.slice(0,4).map(post => <ReportCard key={post.slug} post={post} compact/>)}</div></div></section><section className="section shell"><SectionHead eyebrow="EXPLORE TOPICS" title="Different domains. Same standard of evidence."/><div className="topic-grid"><a href="#/topic/technology-infrastructure"><b>Technology</b><span>AI, infrastructure, platforms and systems</span></a><a href="#/topic/money-business"><b>Markets</b><span>Money, incentives, business and risk</span></a><a href="#/topic/media-culture"><b>Culture</b><span>Media, sports, behavior and identity</span></a><a href="#/topic/systems-everyday-life"><b>Public Systems</b><span>Policy, institutions and operations</span></a></div></section><section className="section shell"><SectionHead eyebrow="LATEST REPORTS" title="The current file." link="#/archive" label="Browse archive"/><div className="latest-grid">{posts.slice(0,6).map(post => <ReportCard key={post.slug} post={post}/>)}</div></section><section className="research"><div className="shell research-grid"><div><p className="eyebrow">RESEARCH & DECISION SUPPORT</p><h2>Your data.<br/>Your decisions.<em>Your rights.</em></h2><p>Research for people who need to understand what the evidence supports, what it does not, and what deserves another question.</p><a className="secondary gold" href="#/page/research-services">Research services</a></div><div className="principles"><div><span>01</span><h3>Evidence & lineage</h3><p>Keep sources distinguishable from interpretation.</p></div><div><span>02</span><h3>Competing explanations</h3><p>Do not collapse ambiguity for convenience.</p></div><div><span>03</span><h3>Decision clarity</h3><p>Show what is known, inferred, uncertain and changeable.</p></div></div></div></section></>;
}
function Archive({ posts, filter, loading }: { posts: Post[]; filter?: string; loading?: boolean }) {
  if (loading && posts.length <= 6) return <Loading/>;
  const visible = filter ? posts.filter(post => post.categorySlug === filter || (filter === 'media-culture' && post.categorySlug === 'culture-pie')) : posts;
  return <section className="interior shell"><a className="back" href="#/">← Home</a><div className="page-head"><p className="eyebrow">REPORT ARCHIVE</p><h1>{filter ? visible[0]?.category || 'Topic reports' : 'The complete current file'}</h1><p>{visible.length} reports.</p></div><div className="archive-grid">{visible.map(post => <ReportCard key={post.slug} post={post}/>)}</div></section>;
}
function ReportView({ slug, preview }: { slug: string; preview?: Post }) {
  const [post, setPost] = useState<Post | undefined>(preview?.content ? preview : undefined);
  useEffect(() => {
    let active = true;
    if (preview?.content) { setPost(preview); return () => { active = false; }; }
    fetch(`${API}/posts?slug=${encodeURIComponent(slug)}&_fields=id,slug,date,title,excerpt,content,categories`).then(r => r.ok ? r.json() : Promise.reject()).then(items => active && items[0] && setPost(toPost(items[0]))).catch(() => {});
    return () => { active = false; };
  }, [slug, preview?.content]);
  if (!post) return <Loading/>;
  return <section className="interior shell"><a className="back" href="#/archive">← Back to reports</a><article className="article"><ArticleImage post={post} priority/><header><p className="eyebrow accent">{post.category} · {new Date(post.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p><h1>{post.title}</h1><p className="deck">{post.excerpt}</p></header><div className="article-body" dangerouslySetInnerHTML={{__html: post.content}}/></article></section>;
}
function PageView({ slug }: { slug: string }) {
  const [page, setPage] = useState<PageData | null>(null); const [failed, setFailed] = useState(false);
  useEffect(() => { setPage(null); setFailed(false); fetch(`${API}/pages?slug=${encodeURIComponent(slug)}&_fields=title,content`).then(r => r.ok ? r.json() : Promise.reject()).then(items => { if (!items[0]) throw new Error(); setPage({ title: cleanText(items[0].title?.rendered), content: cleanHtml(items[0].content?.rendered) }); }).catch(() => setFailed(true)); }, [slug]);
  if (failed) return <section className="interior shell"><h1>Page unavailable.</h1></section>; if (!page) return <Loading/>;
  return <section className="interior shell"><a className="back" href="#/">← Home</a><article className="static-page"><p className="eyebrow accent">THE RADIENT REVIEW</p><h1>{page.title}</h1><div className="article-body" dangerouslySetInnerHTML={{__html: page.content}}/></article></section>;
}
function Topics() { return <section className="interior shell"><a className="back" href="#/">← Home</a><div className="page-head"><p className="eyebrow">EXPLORE TOPICS</p><h1>Different domains. One living system.</h1></div><div className="topic-directory"><a href="#/topic/technology-infrastructure"><b>Technology</b><span>AI, infrastructure, platforms and systems</span></a><a href="#/topic/money-business"><b>Markets</b><span>Money, incentives, business and risk</span></a><a href="#/topic/media-culture"><b>Culture</b><span>Media, sports, behavior and identity</span></a><a href="#/topic/systems-everyday-life"><b>Public Systems</b><span>Policy, institutions and operations</span></a></div></section>; }
function Loading() { return <section className="interior shell"><p className="eyebrow accent">FOLLOWING THE SIGNAL</p><h1>Loading…</h1></section>; }
function SearchModal({ posts, onClose }: { posts: Post[]; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => { const q = query.trim().toLowerCase(); return q ? posts.filter(post => `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(q)).slice(0,8) : []; }, [query, posts]);
  const submit = (event: FormEvent) => event.preventDefault();
  return <div className="modal" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="search-panel"><button className="close" onClick={onClose}><X size={20}/></button><p className="eyebrow accent">SEARCH THE REVIEW</p><h2>What signal are you looking for?</h2><form onSubmit={submit}><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search reports"/></form>{results.length > 0 && <div className="search-results">{results.map(post => <a key={post.slug} href={`#/report/${post.slug}`} onClick={onClose}><span>{post.category}</span><b>{post.title}</b></a>)}</div>}</div></div>;
}
function Footer() { return <footer><div className="shell footer-grid"><div><Brand/><p>Your data. Your decisions. Your rights.</p></div><div><a href="#/archive">Reports</a><a href="#/page/about">About</a><a href="#/page/request-a-report">Request a report</a><a href="#/page/submit">Feedback</a><a href="#/page/support">Support</a></div></div></footer>; }

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [archiveLoaded, setArchiveLoaded] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetch(`${API}/posts?per_page=6&_fields=${SUMMARY_FIELDS}`).then(r => r.ok ? r.json() : Promise.reject()).then(items => setPosts(items.map(toPost))).catch(() => setPosts([]));
  }, []);
  useEffect(() => {
    const update = () => { setRoute(window.location.hash || '#/'); window.scrollTo(0,0); };
    window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update);
  }, []);
  const path = route.replace(/^#\/?/, '');
  const needsArchive = path === 'archive' || path.startsWith('topic/') || searchOpen;
  useEffect(() => {
    if (!needsArchive || archiveLoaded || archiveLoading) return;
    setArchiveLoading(true);
    fetch(`${API}/posts?per_page=100&_fields=${SUMMARY_FIELDS}`).then(r => r.ok ? r.json() : Promise.reject()).then(items => { setPosts(items.map(toPost)); setArchiveLoaded(true); }).finally(() => setArchiveLoading(false));
  }, [needsArchive, archiveLoaded, archiveLoading]);

  let view: React.ReactNode;
  if (!path) view = <Home posts={posts.slice(0,6)}/>;
  else if (path === 'archive') view = <Archive posts={posts} loading={archiveLoading}/>;
  else if (path === 'topics') view = <Topics/>;
  else if (path.startsWith('topic/')) view = <Archive posts={posts} filter={decodeURIComponent(path.slice(6))} loading={archiveLoading}/>;
  else if (path.startsWith('report/')) { const slug = decodeURIComponent(path.slice(7)); view = <ReportView slug={slug} preview={posts.find(post => post.slug === slug)}/>; }
  else if (path.startsWith('page/')) view = <PageView slug={decodeURIComponent(path.slice(5))}/>;
  else view = <Archive posts={posts} loading={archiveLoading}/>;

  return <div className="app"><Header onSearch={() => setSearchOpen(true)}/><main>{view}</main><Footer/>{searchOpen && <SearchModal posts={posts} onClose={() => setSearchOpen(false)}/>}</div>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);