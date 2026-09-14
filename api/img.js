export default async function handler(req, res) {
  const { path, size = 'w500' } = req.query;
  if (!path) {
    return res.status(400).send('Missing path');
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const tmdbImageUrl = `https://image.tmdb.org/t/p/${size}${cleanPath}`;
  
  try {
    const imgRes = await fetch(tmdbImageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!imgRes.ok) {
      // Fallback redirect to Cloudflare edge CDN
      return res.redirect(302, `https://wsrv.nl/?url=${encodeURIComponent(tmdbImageUrl)}&output=webp`);
    }

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, immutable');
    const buffer = await imgRes.arrayBuffer();
    return res.status(200).send(Buffer.from(buffer));
  } catch {
    return res.redirect(302, `https://wsrv.nl/?url=${encodeURIComponent(tmdbImageUrl)}&output=webp`);
  }
}
