import React, { FormEvent, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ArrowRight, ArrowUpRight, Search, X } from 'lucide-react';
import './styles.css';

type Post = { category: string; title: string; excerpt: string; url: string; tone: string };
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
  ['Technology', 'AI, infrastructure, platforms and systems'], ['Markets', 'Money, incentives, business and risk'],
  ['Culture', 'Media, sports, behavior and identity'], ['Public Systems', 'Policy, institutions and operations'],
];

const resonancePath = ['Signal', 'Evidence', 'Relationships', 'Dissonance', 'Alignment', 'Resonance'];

function Art({tone = 'cyan', tall = false}: {tone?: string; tall?: boolean}) {
  return <div className={`art art-${tone} ${tall ? 'art-tall' : ''}`} aria-hidden="true"><i/><i/><i/></div>;
}

function App() {
  const [posts, setPosts] = useState<Post[]>(fallbackPosts);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('https://public-api.wordpress.com/wp/v2/sites/theradientreview.com/posts?per_page=6&_embed=1')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((items: Array<any>) => {
        const tones = ['violet', 'cyan', 'gold', 'teal', 'violet', 'cyan'];
        const clean = (html: string) => new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() || '';
        const newest = items.map((item, index) => ({ category: item._embedded?.['wp:term']?.[0]?.[0]?.name || 'The Radient Review', title: clean(item.title.rendered), excerpt: clean(item.excerpt.rendered), url: item.link, tone: tones[index] }));
        newest.sort((a, b) => Number(b.title === leadTitle) - Number(a.title === leadTitle));
        if (newest.length) setPosts([...newest, ...fallbackPosts.filter(fallback => !newest.some(post => post.title === fallback.title))].slice(0, 6));
      })
      .catch(() => { /* Keep the featured report usable when the publication is unavailable. */ });
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
    if (query) window.location.assign(`https://theradientreview.com/?s=${encodeURIComponent(query)}`);
  };
  const featured = posts[0];

  return <div className="page">
    <div className="ambient-layer" aria-hidden="true"><i/><i/><i/></div>
    <header className="header shell">
      <a className="brand" href="#top"><span className="mark">R</span><span><b>The Radient Review</b><small>FIND THE SIGNAL. KEEP THE COMPLEXITY.</small></span></a>
      <nav aria-label="Main navigation"><a href="#reports">Reports</a><a href="#topics">Topics</a><a href="#research">Research</a><a href="https://theradientreview.com/about/">About</a><a href="https://theradientreview.com/support/">Support</a></nav>
      <div className="header-actions"><button className="icon" aria-label="Search" aria-haspopup="dialog" onClick={() => setSearchOpen(true)}><Search size={16}/></button><a className="pill" href="https://theradientreview.com/support/">Subscribe</a></div>
    </header>

    <main id="top">
      <section className="hero shell"><div className="hero-copy hero-enter"><p className="eyebrow">INDEPENDENT · CLEAR CONTEXT · OPEN QUESTIONS</p><h1>Find the signal.<em>Keep the complexity.</em></h1><p className="lede">Independent reports on technology, culture, markets, public systems and the patterns connecting them. Clear context without flattening the hard parts.</p><div className="actions"><a className="primary" href="#reports">Explore reports <ArrowUpRight size={16}/></a><a className="secondary" href="#research">How we work</a></div><div className="stats"><div><b>Evidence</b><span>before certainty</span></div><div><b>Context</b><span>before conclusion</span></div><div><b>People</b><span>before product</span></div></div></div><div className="hero-art hero-enter"><Art tone="hero" tall/><div className="art-caption"><small>RESONANCE PRINCIPLE</small><strong>The person is not the product.</strong></div></div></section>

      <section className="resonance-band" aria-label="The Resonance method" data-reveal><div className="shell"><p className="eyebrow">THE LIVING SIGNAL</p><ol>{resonancePath.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><b>{step}</b></li>)}</ol></div></section>

      <section id="reports" className="section shell" data-reveal><div className="section-head"><div><p className="eyebrow">FEATURED REPORT</p><h2>Independent analysis, built to hold up.</h2></div><a href="#latest">Latest reports <ArrowRight size={15}/></a></div><article className="feature-card"><Art tone="violet"/><div className="feature-copy"><p className="eyebrow cyan">{featured.category}</p><h3>{featured.title}</h3><p>{featured.excerpt}</p><a href={featured.url}>Read the featured report <ArrowRight size={16}/></a></div></article></section>

      <section className="trending-wrap" data-reveal><div className="shell"><div className="section-head compact"><div><p className="eyebrow">TRENDING NOW</p><h2>Signals worth following.</h2></div></div><div className="rail">{posts.slice(0, 4).map((post, i) => <article className="rail-card" style={{'--delay': `${i * 70}ms`} as React.CSSProperties} key={post.url}><a href={post.url} aria-label={`Read ${post.title}`}><Art tone={post.tone}/></a><p className="eyebrow cyan">{String(i + 1).padStart(2, '0')} · {post.category}</p><h3><a href={post.url}>{post.title}</a></h3><p>{post.excerpt}</p></article>)}</div></div></section>

      <section id="topics" className="section shell" data-reveal><div className="section-head"><div><p className="eyebrow">EXPLORE TOPICS</p><h2>Different domains. Same standard of evidence.</h2></div></div><div className="topic-grid">{topics.map((topic, i) => <a href={`https://theradientreview.com/?s=${encodeURIComponent(topic[0])}`} className="topic" key={topic[0]}><span className={`dot d${i}`}/><div><b>{topic[0]}</b><p>{topic[1]}</p></div><ArrowUpRight size={18}/></a>)}</div></section>

      <section id="latest" className="section shell" data-reveal><div className="section-head"><div><p className="eyebrow">LATEST REPORTS</p><h2>The current file.</h2></div><a href="https://theradientreview.com/reports/">Browse archive <ArrowRight size={15}/></a></div><div className="latest-grid">{posts.map((post, i) => <article className={`story s${i + 1}`} style={{'--delay': `${i * 55}ms`} as React.CSSProperties} key={post.url}><a href={post.url} aria-label={`Read ${post.title}`}><Art tone={post.tone} tall={i === 1}/></a><div><p className="eyebrow cyan">{post.category}</p><h3><a href={post.url}>{post.title}</a></h3><p>{post.excerpt}</p><a href={post.url}>Read report <ArrowRight size={14}/></a></div></article>)}</div></section>

      <section id="research" className="research" data-reveal><div className="shell research-grid"><div><p className="eyebrow">RESEARCH & DECISION SUPPORT</p><h2>Your data.<br/>Your decisions.<em>Your rights.</em></h2><p>Research for people who need to understand what the evidence supports, what it does not, and what deserves another question.</p><a className="secondary gold" href="https://theradientreview.com/research-services/">Research services</a></div><div className="principles"><div><b>01</b><h3>Evidence & lineage</h3><p>Keep sources distinguishable from interpretation and preserve where claims came from.</p></div><div><b>02</b><h3>Competing explanations</h3><p>Do not collapse ambiguity just because one answer is easier to present.</p></div><div><b>03</b><h3>Decision clarity</h3><p>Show what is known, what is inferred, what is uncertain and what could change the conclusion.</p></div></div></div></section>
      <section id="support" className="section shell" data-reveal><div className="support"><p className="eyebrow">SUPPORT INDEPENDENT THINKING</p><h2>Ideas need independence.</h2><p>The Radient Review is built around analysis that can remain curious, skeptical and transparent.</p><div className="actions"><a className="primary" href="https://theradientreview.com/support/">Support the Review <ArrowUpRight size={16}/></a><a className="secondary" href="https://theradientreview.com/">Visit current publication</a></div></div></section>
    </main>

    <footer id="about" className="footer"><div className="shell footer-grid"><div><div className="brand"><span className="mark">R</span><span><b>The Radient Review</b><small>INDEPENDENT ANALYSIS · RESONANCE</small></span></div><p>Your data. Your decisions. Your rights.</p></div><div><a href="https://theradientreview.com/reports/">Reports</a><a href="https://theradientreview.com/about/">About</a><a href="https://theradientreview.com/support/">Support</a></div></div></footer>

    {searchOpen && <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setSearchOpen(false)}><section className="search-modal" role="dialog" aria-modal="true" aria-labelledby="search-title"><button className="modal-close" aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={20}/></button><p className="eyebrow cyan">SEARCH THE REVIEW</p><h2 id="search-title">What signal are you looking for?</h2><form onSubmit={submitSearch}><label htmlFor="site-search">Search reports and analysis</label><div><input ref={searchInput} id="site-search" name="s" type="search" required/><button className="primary" type="submit">Search <ArrowRight size={16}/></button></div></form><p className="escape-note">Press Escape to close</p></section></div>}
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
