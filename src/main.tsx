import React from 'react';
import ReactDOM from 'react-dom/client';
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import './styles.css';

const latest = [
  ['Technology', 'Systems are changing faster than the rules around them.', 'A closer look at the infrastructure, incentives and decisions shaping the next layer of technology.', 'cyan'],
  ['Culture', 'The story beneath the story.', 'Media, sports, identity and the public signals that reveal where culture is actually moving.', 'violet'],
  ['Markets', 'Follow the pressure, not the noise.', 'Independent analysis of money, incentives, power and the consequences behind the headline number.', 'gold'],
  ['Public Systems', 'Institutions are interfaces too.', 'How policy, public agencies and operational systems affect the people moving through them.', 'teal'],
  ['Research', 'Evidence before certainty.', 'Decision support built around sources, competing explanations, uncertainty and what remains unresolved.', 'violet'],
  ['The Method', 'Complexity without confusion.', 'A transparent way to organize evidence, test assumptions and preserve dissonance until its purpose is understood.', 'cyan'],
] as const;

const topics = [
  ['Technology', 'AI, infrastructure, platforms and systems'],
  ['Markets', 'Money, incentives, business and risk'],
  ['Culture', 'Media, sports, behavior and identity'],
  ['Public Systems', 'Policy, institutions and operations'],
];

function Art({tone='cyan', tall=false}:{tone?:string; tall?:boolean}) {
  return <div className={`art art-${tone} ${tall?'art-tall':''}`} aria-hidden="true"><i/><i/><i/></div>;
}

function App() {
  return (
    <div className="page">
      <header className="header shell">
        <a className="brand" href="#top"><span className="mark">R</span><span><b>The Radient Review</b><small>FIND THE SIGNAL. KEEP THE COMPLEXITY.</small></span></a>
        <nav><a href="#reports">Reports</a><a href="#topics">Topics</a><a href="#research">Research</a><a href="#about">About</a><a href="#support">Support</a></nav>
        <div className="header-actions"><button className="icon" aria-label="Search"><Search size={16}/></button><a className="pill" href="#support">Subscribe</a></div>
      </header>

      <main id="top">
        <section className="hero shell">
          <div className="hero-copy">
            <p className="eyebrow">INDEPENDENT · CLEAR CONTEXT · OPEN QUESTIONS</p>
            <h1>Find the signal.<em>Keep the complexity.</em></h1>
            <p className="lede">Independent reports on technology, culture, markets, public systems and the patterns connecting them. Clear context without flattening the hard parts.</p>
            <div className="actions"><a className="primary" href="#reports">Explore reports <ArrowUpRight size={16}/></a><a className="secondary" href="#research">How we work</a></div>
            <div className="stats"><div><b>Evidence</b><span>before certainty</span></div><div><b>Context</b><span>before conclusion</span></div><div><b>People</b><span>before product</span></div></div>
          </div>
          <div className="hero-art"><Art tone="hero" tall/><div className="art-caption"><small>RESONANCE PRINCIPLE</small><strong>The person is not the product.</strong></div></div>
        </section>

        <section id="reports" className="section shell">
          <div className="section-head"><div><p className="eyebrow">FEATURED REPORT</p><h2>Independent analysis, built to hold up.</h2></div><a href="#latest">Latest reports <ArrowRight size={15}/></a></div>
          <article className="feature-card"><Art tone="violet"/><div className="feature-copy"><p className="eyebrow cyan">THE RADIENT REVIEW</p><h3>What changes when you stop treating complexity as a problem to erase?</h3><p>Our reports separate evidence from inference, surface uncertainty, and preserve competing explanations long enough to understand what they are actually telling us.</p><a href="#research">Explore the research approach <ArrowRight size={16}/></a></div></article>
        </section>

        <section className="trending-wrap"><div className="shell"><div className="section-head compact"><div><p className="eyebrow">TRENDING NOW</p><h2>Signals worth following.</h2></div></div><div className="rail">{latest.slice(0,4).map((x,i)=><article className="rail-card" key={x[0]}><Art tone={x[3]}/><p className="eyebrow cyan">{String(i+1).padStart(2,'0')} · {x[0]}</p><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></div></section>

        <section id="topics" className="section shell">
          <div className="section-head"><div><p className="eyebrow">EXPLORE TOPICS</p><h2>Different domains. Same standard of evidence.</h2></div></div>
          <div className="topic-grid">{topics.map((t,i)=><a href="#latest" className="topic" key={t[0]}><span className={`dot d${i}`}/><div><b>{t[0]}</b><p>{t[1]}</p></div><ArrowUpRight size={18}/></a>)}</div>
        </section>

        <section id="latest" className="section shell">
          <div className="section-head"><div><p className="eyebrow">LATEST REPORTS</p><h2>The current file.</h2></div><a href="https://theradientreview.com/reports/">Browse archive <ArrowRight size={15}/></a></div>
          <div className="latest-grid">{latest.map((x,i)=><article className={`story s${i+1}`} key={x[0]}><Art tone={x[3]} tall={i===1}/><div><p className="eyebrow cyan">{x[0]}</p><h3>{x[1]}</h3><p>{x[2]}</p><a href="https://theradientreview.com/reports/">Read report <ArrowRight size={14}/></a></div></article>)}</div>
        </section>

        <section id="research" className="research"><div className="shell research-grid"><div><p className="eyebrow">RESEARCH & DECISION SUPPORT</p><h2>Your data.<br/>Your decisions.<em>Your rights.</em></h2><p>Research for people who need to understand what the evidence supports, what it does not, and what deserves another question.</p><a className="secondary gold" href="https://theradientreview.com/resonance-research-decision-support/">Research services</a></div><div className="principles"><div><b>01</b><h3>Evidence & lineage</h3><p>Keep sources distinguishable from interpretation and preserve where claims came from.</p></div><div><b>02</b><h3>Competing explanations</h3><p>Do not collapse ambiguity just because one answer is easier to present.</p></div><div><b>03</b><h3>Decision clarity</h3><p>Show what is known, what is inferred, what is uncertain and what could change the conclusion.</p></div></div></div></section>

        <section id="support" className="section shell"><div className="support"><p className="eyebrow">SUPPORT INDEPENDENT THINKING</p><h2>Ideas need independence.</h2><p>The Radient Review is built around analysis that can remain curious, skeptical and transparent.</p><div className="actions"><a className="primary" href="https://theradientreview.com/support-contact/">Support the Review <ArrowUpRight size={16}/></a><a className="secondary" href="https://theradientreview.com/">Visit current publication</a></div></div></section>
      </main>

      <footer id="about" className="footer"><div className="shell footer-grid"><div><div className="brand"><span className="mark">R</span><span><b>The Radient Review</b><small>INDEPENDENT ANALYSIS · RESONANCE</small></span></div><p>Your data. Your decisions. Your rights.</p></div><div><a href="https://theradientreview.com/reports/">Reports</a><a href="https://theradientreview.com/about/">About</a><a href="https://theradientreview.com/support-contact/">Support</a></div></div></footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
