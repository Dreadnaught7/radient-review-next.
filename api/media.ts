const ALLOWED_HOST = 'zginbimbiuhzlkbxsemm.supabase.co';
const ALLOWED_PREFIX = '/storage/v1/object/public/radient-media/';

export default async function handler(req: any, res: any) {
  const raw = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url;
  if (!raw) return res.status(400).send('Missing image URL');

  let source: URL;
  try { source = new URL(raw); } catch { return res.status(400).send('Invalid image URL'); }
  if (source.protocol !== 'https:' || source.hostname !== ALLOWED_HOST || !source.pathname.startsWith(ALLOWED_PREFIX)) {
    return res.status(403).send('Image source not allowed');
  }

  try {
    const upstream = await fetch(source.toString());
    if (!upstream.ok) return res.status(upstream.status || 502).send('Image unavailable');
    const bytes = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/png');
    res.setHeader('Content-Length', String(bytes.length));
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800');
    return res.status(200).send(bytes);
  } catch (error) {
    console.error('media proxy error', error);
    return res.status(502).send('Image proxy failed');
  }
}
