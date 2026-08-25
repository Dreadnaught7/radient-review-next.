const secondaries = {
  sports: [
    ['https://upload.wikimedia.org/wikipedia/commons/1/14/Madison_Square_Garden_1968.jpeg','Madison Square Garden · Public domain'],
    ['https://upload.wikimedia.org/wikipedia/commons/7/78/Knicks_playing_at_Madison_Square_Garden.jpg','Knicks at Madison Square Garden · Public domain']
  ],
  technology: [
    ['https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Technician_with_laptop_working_on_server_rack_at_NERSC.jpg/1280px-Technician_with_laptop_working_on_server_rack_at_NERSC.jpg','Computing infrastructure · CC0'],
    ['https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Rear_of_rack_at_NERSC_data_center_-_closeup.jpg/1280px-Rear_of_rack_at_NERSC_data_center_-_closeup.jpg','Data-center systems · CC0']
  ],
  markets: [
    ['https://upload.wikimedia.org/wikipedia/commons/0/03/Floor_of_Toronto_Stock_Exchange_1956.jpg','Stock-exchange floor · Public domain']
  ],
  culture: [
    ['https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Fort_Greene_Parkhouse_jeh.JPG/1280px-Fort_Greene_Parkhouse_jeh.JPG','Fort Greene Park · CC0']
  ]
};

function groupFor(text='') {
  if (/knicks|basketball|garden|nba|sports/i.test(text)) return 'sports';
  if (/market|money|finance|trading|business/i.test(text)) return 'markets';
  if (/culture|brooklyn|music|movie|film|harlem/i.test(text)) return 'culture';
  return 'technology';
}

function makeFigure(src, caption) {
  const figure = document.createElement('figure');
  figure.className = 'rr-inline-photo';
  figure.dataset.rrInjected = 'true';
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  img.loading = 'lazy';
  img.decoding = 'async';
  const cap = document.createElement('figcaption');
  cap.textContent = `${caption} · Wikimedia Commons`;
  figure.append(img, cap);
  return figure;
}

function enhanceArticle() {
  const article = document.querySelector('.report-document');
  if (!article || article.dataset.rrEnhanced === 'true') return;
  const body = article.querySelector('.article-body');
  const hero = article.querySelector('.report-visual img.art-photo');
  if (!body || !hero) return;
  const title = article.querySelector('h1')?.textContent || '';
  const meta = article.querySelector('.eyebrow')?.textContent || '';
  const group = groupFor(`${title} ${meta}`);
  const photos = secondaries[group] || secondaries.technology;
  const paras = [...body.querySelectorAll(':scope > p')];
  const heads = [...body.querySelectorAll(':scope > h2, :scope > h3')];
  const anchors = [];
  if (paras[1]) anchors.push(paras[1]);
  else if (heads[0]) anchors.push(heads[0]);
  if (paras.length > 5) anchors.push(paras[Math.min(5, paras.length - 1)]);
  else if (heads[1]) anchors.push(heads[1]);

  anchors.slice(0,2).forEach((anchor, index) => {
    const choice = photos[index % photos.length];
    const figure = makeFigure(choice[0], choice[1]);
    anchor.insertAdjacentElement('afterend', figure);
  });
  article.dataset.rrEnhanced = 'true';
}

const observer = new MutationObserver(() => enhanceArticle());
observer.observe(document.documentElement, {childList:true, subtree:true});
window.addEventListener('hashchange', () => requestAnimationFrame(enhanceArticle));
requestAnimationFrame(enhanceArticle);
