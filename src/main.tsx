import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ArrowRight, Menu, Search, X } from 'lucide-react';
import './styles.css';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  categorySlug: string;
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageQuality?: string;
};
type PageData = { title: string; content: string };
type Service = { name: string; cta: string; path: string; starting_price: number | null };
type ServiceCatalog = { headline: string; services: Service[] };
type PortfolioEntry = {
  slug: string;
  title: string;
  client_display: string;
  category: string;
  status: string;
  summary: string;
  accomplishment: string;
  evidence_note: string;
  project_url?: string | null;
  sort_rank: number;
};

const WP_API = 'https://public-api.wordpress.com/wp/v2/sites/256820440';
const SUPABASE_URL = 'https://zginbimbiuhzlkbxsemm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_L53gFj_uCk0SQ8gdyG6PGw_GafBiZ78';
const SUMMARY_FIELDS = 'id,slug,title,excerpt,published_at,category_names,featured_image_url,featured_image_alt,featured_image_width,featured_image_height,image_quality,sort_rank';
const DETAIL_FIELDS = `${SUMMARY_FIELDS},content_html`;
const API_HEADERS = { apikey: SUPABASE_KEY };

const cleanText = (html = '') => new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() || '';
const cleanHtml = (html = '') => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed').forEach(node => node.remove());
  doc.querySelectorAll('*').forEach(node => [...node.attributes].forEach(attr => attr.name.startsWith('on') && node.removeAttribute(attr.name)));
  return doc.body.innerHTML;
};
const topicSlug = (category = '') => {
  const v = category.toLowerCase();
  if (/tech|science|ai|infrastructure/.test(v)) return 'technology-infrastructure';
  if (/business|market|econom|money|workforce/.test(v)) return 'money-business';
  if (/culture|media|sports|film|music/.test(v)) return 'media-culture';
  if (/public|government|politic|system|law/.test(v)) return 'systems-everyday-life';
  return 'uncategorized';
};
const toPost = (item: any): Post => {
  const category = item.category_names?.[0] || 'The Radient Review';
  return {
    id: String(item.id),
    slug: item.slug,
    title: cleanText(item.title || ''),
    excerpt: cleanText(item.excerpt || ''),
    content: item.content_html ? cleanHtml(item.content_html) : '',
    date: item.published_at || new Date().toISOString(),
    category,
    categorySlug: topicSlug(category),
    imageUrl: item.featured_image_url || undefined,
    imageAlt: item.featured_image_alt || item.title || '',
    imageWidth: item.featured_image_width || undefined,
    imageHeight: item.featured_image_height || undefined,
    imageQuality: item.image_quality || undefined,
  };
};
async function fetchReports(limit = 24, slug?: string, includeContent = false) {
  const params = new URLSearchParams({ select: includeContent ? DETAIL_FIELDS : SUMMARY_FIELDS, status: 'eq.published', is_public: 'eq.true', order: 'sort_rank.asc.nullslast,published_at.desc', limit: String(limit) });
  if (slug) params.set('slug', `eq.${slug}`);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/radient_reports?${params.toString()}`, { headers: API_HEADERS });
  if (!response.ok) throw new Error(`Report API ${response.status}`);
  return (await response.json()).map(toPost) as Post[];
}
async function fetchServiceCatalog(): Promise<ServiceCatalog> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/radient_site_settings?select=value&key=eq.service_catalog`, { headers: API_HEADERS });
  if (!response.ok) throw new Error(`Service API ${response.status}`);
  const rows = await response.json();
  return rows?.[0]?.value || { headline: 'Research and decision support built around the question you need answered.', services: [] };
}
async function fetchPortfolio(): Promise<PortfolioEntry[]> {
  const params = new URLSearchParams({ select: 'slug,title,client_display,category,status,summary,accomplishment,evidence_note,project_url,sort_rank', is_public: 'eq.true', order: 'sort_rank.asc' });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_entries?${params.toString()}`, { headers: API_HEADERS });
  if (!response.ok) throw new Error(`Portfolio API ${response.status}`);
  return await response.json();
}
function hash(input: string) { let value = 0; for (let i = 0; i < input.length; i++) value = ((value << 5) - value + input.charCodeAt(i)) | 0; return Math.abs(value); }
function priceLabel(service: Service) { return service.starting_price ? `Starting at $${service.starting_price.toLocaleString()}` : 'Scoped to the assignment'; }
function serviceHref(service: Service) { return service.path?.startsWith('/#/') ? service.path.slice(1) : (service.path || '#/services'); }

function ArticleImage({ post, priority = false, compact = false }: { post: Post; priority?: boolean; compact?: boolean }) {
  return <div className={`media ${compact ? 'media-compact' : ''}`}>
    {post.imageUrl ? <img src={post.imageUrl} alt={post.imageAlt || ''} width={post.imageWidth || 2688} height={post.imageHeight || 1536} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : 'auto'} referrerPolicy="no-referrer" /> : <div className={`signal signal-${hash(post.slug) % 4}`} />}
    <span>{post.category}</span>
  </div>;
}
function Brand() { return <a className="brand" href="#/"><span className="brand-mark">R</span><span><b>The Radient Review</b><small>FIND THE SIGNAL. KEEP THE COMPLEXITY.</small></span></a>; }
function Header({ onSearch }: { onSearch: () => void }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="shell header-inner"><Brand/><nav className={open ? 'nav-open' : ''}><a href="#/archive" onClick={() => setOpen(false)}>Reports</a><a href="#/topics" onClick={() => setOpen(false)}>Topics</a><a href="#/services" onClick={() => setOpen(false)}>Services</a><a href="#/proof" onClick={() => setOpen(false)}>Proof</a><a href="#/page/about" onClick={() => setOpen(false)}>About</a><a href="#/page/support" onClick={() => setOpen(false)}>Support</a></nav><div className="header-actions"><button className="icon-button" aria-label="Search" onClick={onSearch}><Search size={17}/></button><a className="subscribe" href="#/services">Work with us</a><button className="menu-button" aria-label="Menu" onClick={() => setOpen(v => !v)}>{open ? <X size={20}/> : <Menu size={20}/>}</button></div></div></header>;
}
function SectionHead({ eyebrow, title, link, label }: { eyebrow: string; title: string; link?: string; label?: string }) { return <div className="section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{link && <a href={link}>{label || 'View all'} <ArrowRight size={15}/></a>}</div>; }
function ReportCard({ post, compact = false }: { post: Post; compact?: boolean }) { return <article className={`report-card ${compact ? 'compact-card' : ''}`}><a href={`#/report/${post.slug}`}><ArticleImage post={post} compact={compact}/><div className="card-copy"><p className="eyebrow accent">{post.category}</p><h3>{post.title}</h3>{!compact && <p>{post.excerpt}</p>}<span>Read report <ArrowRight size={14}/></span></div></a></article>; }
function Loading() { return <section className="interior shell"><p className="eyebrow accent">FOLLOWING THE SIGNAL</p><h1>Loading…</h1></section>; }
function ServiceGrid({ catalog, limit }: { catalog: ServiceCatalog; limit?: number }) {
  const items = limit ? catalog.services.slice(0, limit) : catalog.services;
  return <div className="topic-directory">{items.map(service => <a key={service.name} href={serviceHref(service)}><b>{service.name}</b><span>{priceLabel(service)} · {service.cta}</span></a>)}</div>;
}
function ProofGrid({ entries, limit }: { entries: PortfolioEntry[]; limit?: number }) {
  const items = limit ? entries.slice(0, limit) : entries;
  return <div className="latest-grid">{items.map(entry => <article className="report-card" key={entry.slug}><div className="card-copy"><p className="eyebrow accent">{entry.category}</p><h3>{entry.title}</h3><p>{entry.summary}</p><p><b>{entry.client_display}</b></p><span>{entry.status === 'active_engagement' ? 'Active engagement' : 'Capability / proof'} <ArrowRight size={14}/></span></div></article>)}</div>;
}
function Home({ posts, loading, services, portfolio }: { posts: Post[]; loading: boolean; services: ServiceCatalog; portfolio: PortfolioEntry[] }) {
  const lead = posts[0]; if (!lead) return loading ? <Loading/> : <section className="interior shell"><h1>Reports unavailable.</h1></section>;
  return <><section className="hero shell"><div className="hero-copy"><p className="eyebrow">INDEPENDENT · CLEAR CONTEXT · OPEN QUESTIONS</p><h1>Find the signal.<em>Keep the complexity.</em></h1><p className="lede">Independent reports, evidence research and decision support across technology, culture, markets, investigations and public systems.</p><div className="hero-actions"><a className="primary" href="#/archive">Explore reports <ArrowRight size={15}/></a><a className="secondary" href="#/services">Research services</a></div></div><a className="hero-feature" href={`#/report/${lead.slug}`}><ArticleImage post={lead} priority/><div><p className="eyebrow accent">LATEST SIGNAL</p><h2>{lead.title}</h2></div></a></section><section className="method-band"><div className="shell method-grid"><div><span>01</span><b>Signal</b></div><div><span>02</span><b>Evidence</b></div><div><span>03</span><b>Dissonance</b></div><div><span>04</span><b>Alignment</b></div><div><span>05</span><b>Resonance</b></div></div></section><section className="section shell"><SectionHead eyebrow="FEATURED REPORT" title="Independent analysis, built to hold up." link="#/archive" label="Latest reports"/><div className="featured-layout"><ArticleImage post={lead}/><div className="featured-copy"><p className="eyebrow accent">{lead.category}</p><h2>{lead.title}</h2><p>{lead.excerpt}</p><a href={`#/report/${lead.slug}`}>Read the featured report <ArrowRight size={15}/></a></div></div></section><section className="section tinted"><div className="shell"><SectionHead eyebrow="RESEARCH SERVICES" title="Turn a hard question into usable intelligence." link="#/services" label="View services"/><p className="lede">{services.headline}</p><ServiceGrid catalog={services} limit={4}/></div></section><section className="section shell"><SectionHead eyebrow="PROOF OF WORK" title="What the system can produce." link="#/proof" label="See capabilities"/><ProofGrid entries={portfolio} limit={3}/></section><section className="section tinted"><div className="shell"><SectionHead eyebrow="TRENDING NOW" title="Signals worth following."/><div className="trending-grid">{posts.slice(0,4).map(post => <ReportCard key={post.slug} post={post} compact/>)}</div></div></section><section className="section shell"><SectionHead eyebrow="LATEST REPORTS" title="The current file." link="#/archive" label="Browse archive"/><div className="latest-grid">{posts.slice(0,9).map(post => <ReportCard key={post.slug} post={post}/>)}</div></section></>;
}
function Archive({ posts, filter, loading }: { posts: Post[]; filter?: string; loading?: boolean }) {
  const [visibleCount, setVisibleCount] = useState(18); useEffect(() => setVisibleCount(18), [filter]);
  if (loading && !posts.length) return <Loading/>;
  const visible = filter ? posts.filter(post => post.categorySlug === filter || (filter === 'media-culture' && post.categorySlug === 'culture-pie')) : posts;
  return <section className="interior shell"><a className="back" href="#/">← Home</a><div className="page-head"><p className="eyebrow">REPORT ARCHIVE</p><h1>{filter ? visible[0]?.category || 'Topic reports' : 'The complete current file'}</h1><p>{visible.length} reports.</p></div><div className="archive-grid">{visible.slice(0,visibleCount).map(post => <ReportCard key={post.slug} post={post}/>)}</div>{visibleCount < visible.length && <div style={{display:'flex',justifyContent:'center',padding:'28px 0 8px'}}><button className="secondary" onClick={() => setVisibleCount(v => v + 18)}>Load more reports</button></div>}</section>;
}
function ReportView({ slug, preview }: { slug: string; preview?: Post }) {
  const [post, setPost] = useState<Post | undefined>(preview?.content ? preview : undefined);
  useEffect(() => { let active = true; setPost(preview?.content ? preview : undefined); if (preview?.content) return () => { active = false; }; fetchReports(1, slug, true).then(items => active && setPost(items[0])).catch(() => {}); return () => { active = false; }; }, [slug, preview?.content]);
  if (!post) return <Loading/>;
  return <section className="interior shell"><a className="back" href="#/archive">← Back to reports</a><article className="article"><ArticleImage post={post} priority/><header><p className="eyebrow accent">{post.category} · {new Date(post.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p><h1>{post.title}</h1><p className="deck">{post.excerpt}</p></header><div className="article-body" dangerouslySetInnerHTML={{__html: post.content}}/></article></section>;
}
function Services({ catalog, portfolio }: { catalog: ServiceCatalog; portfolio: PortfolioEntry[] }) {
  return <section className="interior shell"><a className="back" href="#/">← Home</a><div className="page-head"><p className="eyebrow">RESEARCH · EVIDENCE · DECISION SUPPORT</p><h1>Bring us the question that is costing you time.</h1><p>{catalog.headline}</p></div><ServiceGrid catalog={catalog}/><section className="section"><SectionHead eyebrow="WHAT DELIVERY LOOKS LIKE" title="Examples, not vague promises." link="#/proof" label="View proof"/><ProofGrid entries={portfolio} limit={6}/></section><div className="hero-actions"><a className="primary" href="#/page/request-a-report">Request a project <ArrowRight size={15}/></a><a className="secondary" href="#/page/research-services">Research intake</a></div></section>;
}
function Proof({ entries }: { entries: PortfolioEntry[] }) {
  return <section className="interior shell"><a className="back" href="#/">← Home</a><div className="page-head"><p className="eyebrow">PROOF OF WORK</p><h1>Working systems, samples and applied research.</h1><p>Client work is identified only where an engagement exists. Demonstrations and internal systems are labeled as such.</p></div><div className="archive-grid">{entries.map(entry => <article className="report-card" key={entry.slug}><div className="card-copy"><p className="eyebrow accent">{entry.category} · {entry.status.replaceAll('_',' ')}</p><h3>{entry.title}</h3><p>{entry.summary}</p><p><b>Built for:</b> {entry.client_display}</p><p><b>What was produced:</b> {entry.accomplishment}</p><p><small>{entry.evidence_note}</small></p>{entry.project_url && <a href={entry.project_url} target="_blank" rel="noreferrer">View project <ArrowRight size={14}/></a>}</div></article>)}</div></section>;
}
function PageView({ slug }: { slug: string }) {
  const [page, setPage] = useState<PageData | null>(null); const [failed, setFailed] = useState(false);
  useEffect(() => { setPage(null); setFailed(false); fetch(`${WP_API}/pages?slug=${encodeURIComponent(slug)}&_fields=title,content`).then(r => r.ok ? r.json() : Promise.reject()).then(items => { if (!items[0]) throw new Error(); setPage({ title: cleanText(items[0].title?.rendered), content: cleanHtml(items[0].content?.rendered) }); }).catch(() => setFailed(true)); }, [slug]);
  if (failed) return <section className="interior shell"><h1>Page unavailable.</h1></section>; if (!page) return <Loading/>;
  return <section className="interior shell"><a className="back" href="#/">← Home</a><article className="static-page"><p className="eyebrow accent">THE RADIENT REVIEW</p><h1>{page.title}</h1><div className="article-body" dangerouslySetInnerHTML={{__html: page.content}}/></article></section>;
}
function Topics() { return <section className="interior shell"><a className="back" href="#/">← Home</a><div className="page-head"><p className="eyebrow">EXPLORE TOPICS</p><h1>Different domains. One living system.</h1></div><div className="topic-directory"><a href="#/topic/technology-infrastructure"><b>Technology</b><span>AI, infrastructure, platforms and systems</span></a><a href="#/topic/money-business"><b>Markets</b><span>Money, incentives, business and risk</span></a><a href="#/topic/media-culture"><b>Culture</b><span>Media, sports, behavior and identity</span></a><a href="#/topic/systems-everyday-life"><b>Public Systems</b><span>Policy, institutions and operations</span></a></div></section>; }
function SearchModal({ posts, onClose }: { posts: Post[]; onClose: () => void }) {
  const [query, setQuery] = useState(''); const results = useMemo(() => { const q = query.trim().toLowerCase(); return q ? posts.filter(post => `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(q)).slice(0,8) : []; }, [query, posts]); const submit = (event: FormEvent) => event.preventDefault();
  return <div className="modal" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="search-panel"><button className="close" onClick={onClose}><X size={20}/></button><p className="eyebrow accent">SEARCH THE REVIEW</p><h2>What signal are you looking for?</h2><form onSubmit={submit}><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search reports"/></form>{results.length > 0 && <div className="search-results">{results.map(post => <a key={post.slug} href={`#/report/${post.slug}`} onClick={onClose}><span>{post.category}</span><b>{post.title}</b></a>)}</div>}</div></div>;
}
function Footer() { return <footer><div className="shell footer-grid"><div><Brand/><p>Your data. Your decisions. Your rights.</p></div><div><a href="#/archive">Reports</a><a href="#/services">Services</a><a href="#/proof">Proof</a><a href="#/page/about">About</a><a href="#/page/request-a-report">Request a project</a><a href="#/page/support">Support</a></div></div></footer>; }
function App() {
  const [posts, setPosts] = useState<Post[]>([]); const [archivePosts, setArchivePosts] = useState<Post[]>([]); const [services, setServices] = useState<ServiceCatalog>({ headline: 'Research and decision support built around the question you need answered.', services: [] }); const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]); const [loading, setLoading] = useState(true); const [archiveLoading, setArchiveLoading] = useState(false); const [route, setRoute] = useState(window.location.hash || '#/'); const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => { Promise.all([fetchReports(24), fetchServiceCatalog(), fetchPortfolio()]).then(([reportRows, serviceRows, portfolioRows]) => { setPosts(reportRows); setServices(serviceRows); setPortfolio(portfolioRows); }).catch(() => setPosts([])).finally(() => setLoading(false)); }, []);
  useEffect(() => { const path = route.replace(/^#\/?/, ''); const needsArchive = path === 'archive' || path.startsWith('topic/'); if (!needsArchive || archivePosts.length || archiveLoading) return; setArchiveLoading(true); fetchReports(100).then(setArchivePosts).catch(() => setArchivePosts([])).finally(() => setArchiveLoading(false)); }, [route, archivePosts.length, archiveLoading]);
  useEffect(() => { const update = () => { setRoute(window.location.hash || '#/'); window.scrollTo(0,0); }; window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
  const path = route.replace(/^#\/?/, ''); let view: React.ReactNode;
  const browsePosts = archivePosts.length ? archivePosts : posts;
  if (!path) view = <Home posts={posts} loading={loading} services={services} portfolio={portfolio}/>; else if (path === 'archive') view = <Archive posts={browsePosts} loading={archiveLoading}/>; else if (path === 'topics') view = <Topics/>; else if (path === 'services') view = <Services catalog={services} portfolio={portfolio}/>; else if (path === 'proof') view = <Proof entries={portfolio}/>; else if (path.startsWith('topic/')) view = <Archive posts={browsePosts} filter={decodeURIComponent(path.slice(6))} loading={archiveLoading}/>; else if (path.startsWith('report/')) { const slug = decodeURIComponent(path.slice(7)); view = <ReportView slug={slug} preview={browsePosts.find(post => post.slug === slug)}/>; } else if (path.startsWith('page/')) view = <PageView slug={decodeURIComponent(path.slice(5))}/>; else view = <Archive posts={browsePosts} loading={archiveLoading}/>;
  return <div className="app"><Header onSearch={() => setSearchOpen(true)}/><main>{view}</main><Footer/>{searchOpen && <SearchModal posts={browsePosts} onClose={() => setSearchOpen(false)}/>}</div>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);