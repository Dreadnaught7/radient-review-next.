(() => {
  const api = 'https://commons.wikimedia.org/w/api.php';
  const seen = new WeakSet();
  const cache = new Map();
  const handPicked = new Set([
    'who-threatens-knicks-repeat-2026-offseason',
    'knicks-ring-night-garden-53-years-2026',
    'bk-loves-mj-spike-lee-michael-jackson-fort-greene-2026',
    'ai-agents-spend-company-money-who-audits-the-purchase',
    'google-ai-agents-finance-who-audits-the-agent',
    'ai-trading-copilot-human-confirmation'
  ]);

  const clean = (text='') => text.replace(/RADIENT SCREEN\s*#\d+\s*[—-]?/gi,'').replace(/[“”‘’]/g,'').replace(/[^a-z0-9$&' -]/gi,' ').replace(/\s+/g,' ').trim();
  const titleFor = (art) => art.closest('.archive-card,.rail-card,.story,.feature-card,.report-document')?.querySelector('h1,h2,h3')?.textContent?.trim() || '';
  const slugFor = () => location.hash.match(/#\/report\/([^/?]+)/)?.[1] ? decodeURIComponent(location.hash.match(/#\/report\/([^/?]+)/)[1]) : '';
  const keyFor = (title) => clean(title).toLowerCase();

  async function commonsImage(title) {
    const key = keyFor(title);
    if (!key) return null;
    if (cache.has(key)) return cache.get(key);
    try {
      const query = clean(title).split(' ').filter(w => w.length > 2).slice(0,9).join(' ');
      const url = `${api}?origin=*&action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch=${encodeURIComponent(query)}&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=1200`;
      const data = await fetch(url).then(r => r.ok ? r.json() : Promise.reject());
      const pages = Object.values(data?.query?.pages || {}).filter(p => /^image\/(jpeg|png|webp)$/i.test(p.imageinfo?.[0]?.mime || ''));
      if (!pages.length) return null;
      let hash = 0; for (const c of key) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
      const page = pages[Math.abs(hash) % pages.length];
      const info = page.imageinfo?.[0];
      const result = info?.thumburl || info?.url ? {src: info.thumburl || info.url, label: 'Wikimedia Commons'} : null;
      cache.set(key, result);
      return result;
    } catch { return null; }
  }

  async function replaceImage(img) {
    if (seen.has(img)) return;
    seen.add(img);
    const art = img.closest('.art');
    if (!art) return;
    const title = titleFor(art);
    if (!title) return;
    const slug = slugFor();
    if (slug && handPicked.has(slug) && art.closest('.report-document')) return;
    const result = await commonsImage(title);
    if (!result) return;
    img.src = result.src;
    img.removeAttribute('srcset');
    const credit = art.querySelector('.art-credit');
    if (credit) credit.textContent = result.label;
  }

  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    io.unobserve(entry.target);
    replaceImage(entry.target);
  }), {rootMargin:'500px 0px'});

  function scan() {
    document.querySelectorAll('img.art-photo').forEach(img => { if (!seen.has(img)) io.observe(img); });
  }
  const mo = new MutationObserver(scan);
  mo.observe(document.documentElement,{childList:true,subtree:true});
  addEventListener('hashchange',() => requestAnimationFrame(scan));
  requestAnimationFrame(scan);
})();
