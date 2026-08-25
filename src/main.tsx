import React, { FormEvent, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ArrowRight, ArrowUpRight, Search, X } from 'lucide-react';
import './styles.css';

type Post = { category: string; categorySlug?: string; title: string; excerpt: string; url: string; tone: string; slug?: string; content?: string; date?: string };
const leadTitle = 'Google Is Putting AI Agents Inside Finance. Who Audits the Agent?';
const fallbackPosts: Post[] = [
  { category: 'Technology', title: leadTitle, excerpt: 'Google is moving AI agents into financial workflows, raising a harder question about oversight, accountability, and who verifies the systems doing the work.', url: 'https://theradientreview.com/?s=Google+Is+Putting+AI+Agents+Inside+Finance', tone: 'violet' },
  { category: 'Technology', title: 'AI Is Learning to Act on Your Behalf. Consent Has Not Caught Up.', excerpt: 'Agentic systems promise to handle more decisions for us, but delegation is not the same thing as informed consent or meaningful control.', url: 'https://theradientreview.com/?s=AI+Is+Learning+to+Act+on+Your+Behalf', tone: 'cyan' },
  { category: 'Markets', title: 'The Market Is Pricing the AI Boom. Who Is Pricing the Risk?', excerpt: 'The investment case for artificial intelligence is moving faster than the evidence about its costs, dependencies, and uneven returns.', url: 'https://theradientreview.com/?s=The+Market+Is+Pricing+the+AI+Boom', tone: 'gold' },
  { category: 'Public Systems', title: 'When Government Buys AI, the Public Inherits the Black Box', excerpt: 'Automated public services can scale decisions quickly while making it harder for the people affected by them to see or challenge the reasoning.', url: 'https://theradientreview.com/?s=When+Government+Buys+AI', tone: 'teal' },
  { category: 'Culture', title: 'The Feed Knows What Holds Your Attention. That Is Not the Same as Knowing You.', excerpt: 'Recommendation systems are optimized around measurable behavior, leaving identity, intent, and context outside the frame.', url: 'https://theradientreview.com/?s=The+Feed+Knows+What+Holds+Your+Attention', tone: 'violet' },
  { category: 'Technology', title: 'The Cloud Was Supposed to Simplify Everything. It Changed Who Holds the Leverage.', excerpt: 'Cloud infrastructure made computing easier to access while concentrating important choices about cost, resilience, and control.', url: 'https://theradientreview.com/?s=The+Cloud+Was+Supposed+to+Simplify+Everything', tone: 'cyan' },
];
const topics = [
  ['Technology', 'AI, infrastructure, platforms and systems', 'technology-infrastructure'], ['Markets', 'Money, incentives, business and risk', 'money-business'],
  ['Culture', 'Media, sports, behavior and identity', 'media-culture'], ['Public Systems', 'Policy, institutions and operations', 'systems-everyday-life'],
];

const resonancePath = ['Signal', 'Evidence', 'Relationships', 'Dissonance', 'Alignment', 'Resonance'];

function Art({tone = 'cyan', tall = false, label = 'Signal'}: {tone?: string; tall?: boolean; label?: string}) {
  return <div className={`art art-${tone} ${tall ? 'art-tall' : ''}`} aria-hidden="true">
    <span className="art-grid"/>
    <span className="art-orbit"><b/><b/><b/></span>
    <svg className="art-trace" viewBox="0 0 100 55" preserveAspectRatio="none"><path d="M-4 43 C12 43 12 17 28 17 S45 42 58 29 72 8 104 10"/><circle cx="28" cy="17" r="1.4"/><circle cx="58" cy="29" r="1.4"/><circle cx="82" cy="11" r="1.4"/></svg>
    <span className="art-label">{label}</span><span className="art-code">RR / {tone.toUpperCase()}</span>
    <i/><i/><i/>
  </div>;
}

const cleanText = (html = '') => new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() || '';
const cleanHtml = (html = '') => {
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('script,style,iframe,object,embed').forEach(node => node.remove());
  document.querySelectorAll('*').forEach(node => Array.from(node.attributes).forEach(attribute => attribute.name.startsWith('on') && node.removeAttribute(attribute.name)));
  return document.body.innerHTML;
};
const postFromApi = (item: any, index = 0): Post => {
  const tones = ['violet', 'cyan', 'gold', 'teal', 'violet', 'cyan'];
  const category = item._embedded?.['wp:term']?.[0]?.[0];
  return { category: category?.name || 'The Radient Review', categorySlug: category?.slug, title: cleanText(item.title?.rendered), excerpt: cleanText(item.excerpt?.rendered), content: cleanHtml(item.content?.rendered), url: item.link, slug: item.slug, date: item.date, tone: tones[index % tones.length] };
};
const postHref = (post: Post) => post.slug ? `#/report/${encodeURIComponent(post.slug)}` : post.url;
const keepInsideReview = (event: React.MouseEvent<HTMLElement>) => {
  const anchor = (event.target as HTMLElement).closest('a');
  if (!anchor?.href) return;
  const target = new URL(anchor.href);
  if (target.hostname !== 'theradientreview.com') return;
  event.preventDefault();
  const slug = target.pathname.split('/').filter(Boolean).pop();
  const pages = new Set(['about','support','research-services','request-a-report','submit','reports']);
  window.location.hash = slug === 'reports' || !slug ? '/archive' : pages.has(slug) ? `/page/${slug}` : `/report/${slug}`;
};

function InteriorView({path, currentPosts}: {path: string; currentPosts: Post[]}) {
  const [items, setItems] = useState<Post[]>(currentPosts);
  const [page, setPage] = useState<{title: string; content: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true); setFailed(false); setPage(null);
    if (path.startsWith('page/')) {
      const slug = path.slice(5);
      fetch(`https://public-api.wordpress.com/wp/v2/sites/theradientreview.com/pages?slug=${encodeURIComponent(slug)}`)
        .then(response => response.ok ? response.json() : Promise.reject())
        .then((results: any[]) => { if (active && results[0]) setPage({title: cleanText(results[0].title?.rendered), content: cleanHtml(results[0].content?.rendered)}); else if (active) setFailed(true); })
        .catch(() => active && setFailed(true)).finally(() => active && setLoading(false));
    } else {
      fetch('https://public-api.wordpress.com/wp/v2/sites/theradientreview.com/posts?per_page=100&_embed=1')
        .then(response => response.ok ? response.json() : Promise.reject())
        .then((results: any[]) => active && setItems(results.map(postFromApi)))
        .catch(() => active && setFailed(true)).finally(() => active && setLoading(false));
    }
    return () => { active = false; };
  }, [path]);

  if (loading) return <section className="interior shell"><p className="eyebrow cyan">FOLLOWING THE SIGNAL</p><h1>Loading the current file…</h1><div className="loading-line"/></section>;
  if (path.startsWith('page/')) return <section className="interior shell" data-static-reveal><a className="back-link" href="#/">← Return home</a>{page ? <article className="document"><p className="eyebrow cyan">THE RADIENT REVIEW</p><h1>{page.title}</h1><div className="article-body" onClick={keepInsideReview} dangerouslySetInnerHTML={{__html: page.content}}/></article> : <EmptyState/>}</section>;

  if (path.startsWith('report/')) {
    const slug = decodeURIComponent(path.slice(7));
    const post = items.find(item => item.slug === slug);
    return <section className="interior shell" data-static-reveal><a className="back-link" href="#/archive">← Back to reports</a>{post ? <article className="document report-document"><div className="report-visual"><Art tone={post.tone} tall label={post.category}/></div><p className="eyebrow cyan">{post.category}{post.date ? ` · ${new Date(post.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}` : ''}</p><h1>{post.title}</h1><p className="article-deck">{post.excerpt}</p><div className="article-body" onClick={keepInsideReview} dangerouslySetInnerHTML={{__html: post.content || `<p>${post.excerpt}</p>`}}/></article> : <EmptyState/>}</section>;
  }

  if (path === 'topics') return <section className="interior shell" data-static-reveal><a className="back-link" href="#/">← Return home</a><div className="interior-head"><p className="eyebrow cyan">EXPLORE TOPICS</p><h1>Different domains. One living system.</h1><p>Follow a signal through the complete Radient Review experience.</p></div><div className="topic-directory">{topics.map((topic, index) => <a href={`#/topic/${topic[2]}`} className="topic-file" key={topic[0]}><Art tone={['cyan','gold','violet','teal'][index]} label={topic[0]}/><span className="eyebrow cyan">FILE {String(index + 1).padStart(2,'0')}</span><h2>{topic[0]}</h2><p>{topic[1]}</p><b>Open topic <ArrowRight size={14}/></b></a>)}</div></section>;

  let title = 'The complete current file';
  let eyebrow = 'REPORT ARCHIVE';
  let filtered = items;
  if (path.startsWith('search/')) { const term = decodeURIComponent(path.slice(7)).toLowerCase(); title = `Search: ${decodeURIComponent(path.slice(7))}`; eyebrow = 'SEARCH RESULTS'; filtered = items.filter(item => `${item.title} ${item.excerpt} ${item.category}`.toLowerCase().includes(term)); }
  if (path.startsWith('topic/')) { const slug = decodeURIComponent(path.slice(6)); const topic = topics.find(item => item[2] === slug); title = topic?.[0] || 'Topic reports'; eyebrow = 'TOPIC FILE'; filtered = items.filter(item => item.categorySlug === slug || (slug === 'media-culture' && item.categorySlug === 'culture-pie')); }
  return <section className="interior shell" data-static-reveal><a className="back-link" href="#/">← Return home</a><div className="interior-head"><p className="eyebrow cyan">{eyebrow}</p><h1>{title}</h1><p>{filtered.length} reports, presented in the same living editorial system.</p></div>{failed && <p className="notice">The live archive is temporarily unavailable. Showing the current front-page file.</p>}<div className="archive-grid">{filtered.map((post, index) => <article className="archive-card" key={post.url}><a href={postHref(post)}><Art tone={post.tone} label={post.category}/><p className="eyebrow cyan">{String(index + 1).padStart(2,'0')} · {post.category}</p><h2>{post.title}</h2><p>{post.excerpt}</p><span>Read report <ArrowRight size={14}/></span></a></article>)}</div>{!filtered.length && <EmptyState/>}</section>;
}

function EmptyState(){ return <div className="empty-state"><p className="eyebrow cyan">OPEN QUESTION</p><h2>No matching file was found.</h2><a className="secondary" href="#/archive">Explore all reports</a></div>; }

function App() {
  const [posts, setPosts] = useState<Post[]>(fallbackPosts);
  const [searchOpen, setSearchOpen] = useState(false);
  const [route, setRoute] = useState(window.location.hash || '#/');
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('https://public-api.wordpress.com/wp/v2/sites/theradientreview.com/posts?per_page=6&_embed=1')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((items: Array<any>) => {
        const newest = items.map(postFromApi);
        newest.sort((a, b) => Number(b.title === leadTitle) - Number(a.title === leadTitle));
        if (newest.length) setPosts([...newest, ...fallbackPosts.filter(fallback => !newest.some(post => post.title === fallback.title))].slice(0, 6));
      })
      .catch(() => { /* Keep the featured report usable when the publication is unavailable. */ });
  }, []);

  useEffect(() => {
    const updateRoute = () => { setRoute(window.location.hash || '#/'); window.scrollTo({top: 0, behavior: 'smooth'}); };
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(element => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [posts]);

  useEffect(() => {
    if (!searchOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    searchInput.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setSearchOpen(false);
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus(); };
  }, [searchOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('s')?.toString().trim();
    if (query) { setSearchOpen(false); window.location.hash = `/search/${encodeURIComponent(query)}`; }
  };
  const featured = posts[0];
  const routePath = route.replace(/^#\/?/, '');

  return <div className="page">
    <div className="ambient-layer" aria-hidden="true"><i/><i/><i/></div>
    <header className="header shell">
      <a className="brand" href="#/"><span className="mark">R</span><span><b>The Radient Review</b><small>FIND THE SIGNAL. KEEP THE COMPLEXITY.</small></span></a>
      <nav aria-label="Main navigation"><a href="#/archive">Reports</a><a href="#/topics">Topics</a><a href="#/page/research-services">Research</a><a href="#/page/about">About</a><a href="#/page/support">Support</a></nav>
      <div className="header-actions"><button className="icon" aria-label="Search" aria-haspopup="dialog" onClick={() => setSearchOpen(true)}><Search size={16}/></button><a className="pill" href="#/page/support">Subscribe</a></div>
    </header>

    <main id="top">
      {routePath ? <InteriorView path={routePath} currentPosts={posts}/> : <>
      <section className="hero shell"><div className="hero-copy hero-enter"><p className="eyebrow">INDEPENDENT · CLEAR CONTEXT · OPEN QUESTIONS</p><h1>Find the signal.<em>Keep the complexity.</em></h1><p className="lede">Independent reports on technology, culture, markets, public systems and the patterns connecting them. Clear context without flattening the hard parts.</p><div className="actions"><a className="primary" href="#/archive">Explore reports <ArrowUpRight size={16}/></a><a className="secondary" href="#/page/research-services">How we work</a></div><div className="stats"><div><b>Evidence</b><span>before certainty</span></div><div><b>Context</b><span>before conclusion</span></div><div><b>People</b><span>before product</span></div></div></div><div className="hero-art hero-enter"><Art tone="hero" tall label="Living signal"/><div className="art-caption"><small>RESONANCE PRINCIPLE</small><strong>The person is not the product.</strong></div></div></section>

      <section className="resonance-band" aria-label="The Resonance method" data-reveal><div className="shell"><p className="eyebrow">THE LIVING SIGNAL</p><ol>{resonancePath.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><b>{step}</b></li>)}</ol></div></section>

      <section id="reports" className="section shell" data-reveal><div className="section-head"><div><p className="eyebrow">FEATURED REPORT</p><h2>Independent analysis, built to hold up.</h2></div><a href="#/archive">Latest reports <ArrowRight size={15}/></a></div><article className="feature-card"><Art tone="violet" label={featured.category}/><div className="feature-copy"><p className="eyebrow cyan">{featured.category}</p><h3>{featured.title}</h3><p>{featured.excerpt}</p><a href={postHref(featured)}>Read the featured report <ArrowRight size={16}/></a></div></article></section>

      <section className="trending-wrap" data-reveal><div className="shell"><div className="section-head compact"><div><p className="eyebrow">TRENDING NOW</p><h2>Signals worth following.</h2></div></div><div className="rail">{posts.slice(0, 4).map((post, i) => <article className="rail-card" style={{'--delay': `${i * 70}ms`} as React.CSSProperties} key={post.url}><a href={postHref(post)} aria-label={`Read ${post.title}`}><Art tone={post.tone} label={post.category}/></a><p className="eyebrow cyan">{String(i + 1).padStart(2, '0')} · {post.category}</p><h3><a href={postHref(post)}>{post.title}</a></h3><p>{post.excerpt}</p></article>)}</div></div></section>

      <section id="topics" className="section shell" data-reveal><div className="section-head"><div><p className="eyebrow">EXPLORE TOPICS</p><h2>Different domains. Same standard of evidence.</h2></div></div><div className="topic-grid">{topics.map((topic, i) => <a href={`#/topic/${topic[2]}`} className="topic" key={topic[0]}><span className={`dot d${i}`}/><div><b>{topic[0]}</b><p>{topic[1]}</p></div><ArrowUpRight size={18}/></a>)}</div></section>

      <section id="latest" className="section shell" data-reveal><div className="section-head"><div><p className="eyebrow">LATEST REPORTS</p><h2>The current file.</h2></div><a href="#/archive">Browse archive <ArrowRight size={15}/></a></div><div className="latest-grid">{posts.map((post, i) => <article className={`story s${i + 1}`} style={{'--delay': `${i * 55}ms`} as React.CSSProperties} key={post.url}><a href={postHref(post)} aria-label={`Read ${post.title}`}><Art tone={post.tone} tall={i === 1} label={post.category}/></a><div><p className="eyebrow cyan">{post.category}</p><h3><a href={postHref(post)}>{post.title}</a></h3><p>{post.excerpt}</p><a href={postHref(post)}>Read report <ArrowRight size={14}/></a></div></article>)}</div></section>

      <section id="research" className="research" data-reveal><div className="shell research-grid"><div><p className="eyebrow">RESEARCH & DECISION SUPPORT</p><h2>Your data.<br/>Your decisions.<em>Your rights.</em></h2><p>Research for people who need to understand what the evidence supports, what it does not, and what deserves another question.</p><a className="secondary gold" href="#/page/research-services">Research services</a></div><div className="principles"><div><b>01</b><h3>Evidence & lineage</h3><p>Keep sources distinguishable from interpretation and preserve where claims came from.</p></div><div><b>02</b><h3>Competing explanations</h3><p>Do not collapse ambiguity just because one answer is easier to present.</p></div><div><b>03</b><h3>Decision clarity</h3><p>Show what is known, what is inferred, what is uncertain and what could change the conclusion.</p></div></div></div></section>
      <section id="support" className="section shell" data-reveal><div className="support"><p className="eyebrow">SUPPORT INDEPENDENT THINKING</p><h2>Ideas need independence.</h2><p>The Radient Review is built around analysis that can remain curious, skeptical and transparent.</p><div className="actions"><a className="primary" href="#/page/support">Support the Review <ArrowUpRight size={16}/></a><a className="secondary" href="#/archive">Visit the publication</a></div></div></section>
      </>}
    </main>

    <footer id="about" className="footer"><div className="shell footer-grid"><div><div className="brand"><span className="mark">R</span><span><b>The Radient Review</b><small>INDEPENDENT ANALYSIS · RESONANCE</small></span></div><p>Your data. Your decisions. Your rights.</p></div><div><a href="#/archive">Reports</a><a href="#/page/about">About</a><a href="#/page/request-a-report">Request a report</a><a href="#/page/submit">Feedback</a><a href="#/page/support">Support</a></div></div></footer>

    {searchOpen && <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setSearchOpen(false)}><section className="search-modal" role="dialog" aria-modal="true" aria-labelledby="search-title"><button className="modal-close" aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={20}/></button><p className="eyebrow cyan">SEARCH THE REVIEW</p><h2 id="search-title">What signal are you looking for?</h2><form onSubmit={submitSearch}><label htmlFor="site-search">Search reports and analysis</label><div><input ref={searchInput} id="site-search" name="s" type="search" required/><button className="primary" type="submit">Search <ArrowRight size={16}/></button></div></form><p className="escape-note">Press Escape to close</p></section></div>}
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
